# Rami/qwen2.5-3b-block-diffusion-vgc-regmb-lora

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA de 59,9 millones de parámetros (1,9 % del total) que convierte a Qwen2.5-3B-Instruct en un modelo de lenguaje de difusión por bloques (block diffusion) especializado en una única tarea: escribir equipos de seis Pokémon en formato Pokémon Showdown para el formato `gen9championsvgc2026regmb` (Champions VGC 2026, Regulation Set M-B), condicionado a un win rate objetivo. Lo desarrolla el autor que firma como Rami dentro del proyecto Battle Factory of Porygon-Pi, que plantea la construcción de equipos VGC como un problema de búsqueda.

La arquitectura de difusión por bloques y la función de pérdida son las de Fast-dLLM v2 (bloques de 32 tokens decodificados en paralelo dentro del bloque y de izquierda a derecha entre bloques). A diferencia del checkpoint de 1,5B de Fast-dLLM v2, el modelo base de 3B no recibió preentrenamiento difusivo: este fine-tune es su único entrenamiento como modelo de difusión. El adaptador se publica junto a un script (`load_vgc_writer.py`) que construye la clase de modelo necesaria, fusiona el adaptador y ofrece un muestreador por lotes.

Es relevante ahora por dos motivos: demuestra que un adaptador de rango 32 entrenado en 14 minutos sobre una H100 basta para convertir un LLM autoregresivo de 3B en un generador de difusión por bloques funcional en un dominio estructurado y restringido, y cuantifica el coste real de la decodificación paralela (de 990 a 22.500 equipos por hora según el tamaño de lote).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de difusión por bloques (Fast-dLLM v2: bloques de 32 tokens, decodificación paralela intra-bloque y secuencial entre bloques) sobre los pesos de Qwen2.5-3B-Instruct, con adaptador LoRA |
| Parámetros totales | 3B (modelo base) + 59,9M entrenables en el adaptador (1,9 %) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible para el adaptador; el modelo base Qwen2.5-3B-Instruct declara 32.768 tokens, pero la ficha no confirma el contexto efectivo tras el cambio a difusión por bloques |
| Tipos de cuantización | no disponible; se distribuye en safetensors (bfloat16 en entrenamiento). No hay versiones GGUF, AWQ ni GPTQ publicadas |
| Idiomas soportados | en (inglés) |
| Licencia | qwen-research (Qwen Research License Agreement): solo investigación y evaluación, prohibido el uso comercial |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere la clase de modelo de difusión por bloques de Fast-dLLM v2 cargando los pesos de Qwen2.5-3B-Instruct |

## Arquitectura y entrenamiento

El adaptador se aplica sobre los pesos de Qwen2.5-3B-Instruct, pero la inferencia no es autoregresiva: se usa la pérdida y el esquema de decodificación de Fast-dLLM v2, con bloques de 32 tokens, máscaras complementarias y token shift, y decodificación paralela dentro de cada bloque con un umbral de confianza de 0,9 (y sub-bloques de 8 tokens cuando se activa la caché de bloque). El entrenamiento se calcula únicamente sobre los tokens de respuesta. Los módulos LoRA (rango 32, alpha 64, dropout 0) cubren todas las proyecciones de atención y MLP, y además se entrena la fila del embedding `[MASK]` (id 151665, sin uso en el checkpoint original de Qwen2.5).

Los datos son 8.000 equipos en una sola época: 622 equipos reales del corpus del proyecto (Pikalytics, Limitless, VGCPastes), 5.192 equipos generados por las propias ejecuciones de búsqueda del proyecto y 2.186 equipos sintéticos legales. Cada prompt incluye el win rate medido en batalla del equipo, o `unknown` para los equipos sin etiquetar y para un 15 % de los etiquetados. Hiperparámetros: AdamW, learning rate 2e-4 con 3 % de warm-up y decaimiento lineal, batch 4, 2.000 pasos, bfloat16, sin gradient checkpointing; 14 minutos en una NVIDIA H100 (Modal). La pérdida de validación (entropía cruzada media por token enmascarado, 256 equipos reservados) baja de 0,980 en el paso 500 a 0,682 en el paso 2.000.

| Modelo (misma receta y semilla) | Paso 500 | 1.000 | 1.500 | 2.000 |
|---|---|---|---|---|
| Este adaptador (Qwen2.5-3B + receta) | 0,980 | 0,832 | 0,720 | **0,682** |
| Qwen2.5-1.5B + la misma receta | 1,080 | 0,879 | 0,765 | 0,714 |
| Fast-dLLM v2 1.5B (con preentrenamiento difusivo) | 0,949 | 0,803 | 0,707 | 0,667 |

## Capacidades

- Generación de equipos completos de seis Pokémon en formato paste de Pokémon Showdown para el formato `gen9championsvgc2026regmb`: especie, objeto, habilidad, naturaleza y cuatro movimientos.
- Generación condicionada a un objetivo de win rate con dos decimales (o `unknown`), lo que permite dirigir la muestra hacia equipos teóricamente más fuertes o explorar el espacio de forma neutra.
- Decodificación no autoregresiva por bloques: los 32 tokens de un bloque se generan en paralelo, con lo que se pueden producir muchas secuencias por llamada mediante `generate_batch` (de 1 a 64 equipos por llamada).
- Generación por lotes con caché de bloque opcional (recálculo solo del sub-bloque actual de 8 tokens).
- Reproducibilidad exacta: con una sola fila, decodificación greedy y `exact=True`, el muestreador reproduce token a token la salida de `model.generate` publicada.
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking: es un generador de dominio único en inglés.
- Capacidad multilingüe: no disponible (solo inglés).

## Casos de uso

- Generación de semillas para búsqueda de equipos: el adaptador produce cientos o miles de equipos candidatos por hora que alimentan el pipeline de búsqueda de Battle Factory of Porygon-Pi, en lugar de partir de poblaciones aleatorias.
- Aumento de datos para modelos auxiliares: al generar equipos legales en aproximadamente el 50 % de los casos, sirve para construir corpus de equipos y para entrenar evaluadores o filtros de legalidad con datos etiquetados por el validador de Showdown.
- Estudio de decodificación paralela: el modelo y su script permiten medir el efecto del tamaño de lote y del umbral de confianza en throughput (de 990 a 22.500 equipos/hora) sobre un caso de dominio restringido y verificable automáticamente.
- Investigación sobre control condicional en difusión de texto: el prompt incluye un win rate objetivo, lo que permite estudiar si la condición se respeta en la salida generada y cómo afecta a la diversidad de los equipos.
- Herramienta de borrador para jugadores competitivos: dado un win rate objetivo, genera un primer borrador de equipo que el jugador completa con spreads de Stat Points y niveles, y valida después en Showdown.
- Docencia y demostraciones de modelos de difusión para texto: al necesitar solo una GPU de 80 GB durante 14 minutos para el fine-tune y ser verificable con un validador externo, es un caso práctico para explicar la diferencia entre decodificación autoregresiva y por bloques.
- Análisis de fallos en dominios con restricciones duras: el ~50 % de muestras ilegales (formas inventadas como `Alcremie-Mega`, violaciones de Item Clause, movimientos o habilidades imposibles) constituye un conjunto de errores concreto para estudiar alucinación en dominios simbólicos.
- Exploración de equipos condicionada a un meta concreto: fijando el objetivo `unknown` se obtiene una muestra sin sesgo de win rate, útil para comparar la distribución generada con la del meta real de Pikalytics o Limitless.

## Benchmarks y rendimiento

Legalidad bruta (64 muestras por configuración, objetivo `unknown`, temperatura 1, parseadas y verificadas con el validador de Showdown, sin reparación): entre 27 y 37 de 64 en todas las configuraciones de muestreo, aproximadamente el 50 %. Es la misma tasa que el writer de 1,5B con el mismo objetivo. Los fallos son mayoritariamente formas inventadas, violaciones de Item Clause y movimientos o habilidades que el Pokémon no puede tener.

Velocidad de generación (una NVIDIA H100, bfloat16, 64 equipos por configuración, ~204 tokens por equipo, umbral de confianza 0,9):

| Muestreador | Segundos por equipo | Equipos por hora |
|---|---|---|
| `model.generate` publicado, un equipo por llamada | 3,65 | 990 |
| `generate_batch`, 1 equipo por llamada | 3,30 | 1.090 |
| `generate_batch`, 8 por llamada | 0,88 | 4.100 |
| `generate_batch`, 32 por llamada | 0,24 | 14.700 |
| `generate_batch`, 64 por llamada | 0,17 | 21.100 |
| `generate_batch`, 64 por llamada, con caché de bloque | 0,16 | 22.500 |

Con un equipo por llamada, la H100 dedica unos 24 ms por forward pass de un bloque de 32 tokens, dominado por overhead de lanzamiento y sincronización más que por aritmética, de ahí que el batching sea la palanca principal. La caché de bloque apenas cambia el resultado porque ahorra aritmética que la H100 no necesita. Contenedores H100 distintos difirieron hasta un 25 % en la misma configuración, así que las diferencias pequeñas deben leerse como ruido. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos de Qwen2.5-3B-Instruct en bfloat16 ocupan aproximadamente 6 GB; hay que sumar el adaptador (0,2 GB de repositorio) y la caché de atención, por lo que un presupuesto práctico ronda los 8-12 GB en bfloat16 según longitud de secuencia y tamaño de lote (estimación, no publicada por el autor).
- GPU recomendadas: el autor reporta mediciones en NVIDIA H100 (80 GB) y soporte de `mps` en Apple Silicon mediante `load_vgc_writer.py`. No hay datos publicados para A100, RTX 4090 u otras GPU.
- GPU de consumo: por tamaño (3B en bfloat16) debería caber en tarjetas de 12-16 GB o más, pero el autor no publica pruebas en GPU de consumo; el rendimiento en batching sería muy inferior al de una H100.
- Despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI de forma directa, porque requiere la clase de modelo de difusión por bloques de Fast-dLLM v2 con los pesos de Qwen2.5-3B-Instruct. El camino soportado es `load_vgc_writer.py` (descarga desde Hugging Face, fusiona el adaptador y expone `generate_batch`).
- Latencia y throughput: 0,16-3,65 segundos por equipo en H100 según configuración; de 990 a 22.500 equipos por hora. El propio autor advierte que un umbral de confianza menor (0,7) no compensa en lote, porque cada paso espera a la fila menos confiada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento relevante | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-3B + block diffusion) | 3B + 59,9M LoRA | no disponible | Pérdida de validación 0,682; ~50 % de equipos legales; 22.500 equipos/hora en H100 con lote de 64 | qwen-research (solo investigación) | Hugging Face, requiere script propio |
| Fast-dLLM v2 1.5B | 1,5B | no disponible en la información | Pérdida de validación 0,667 con la misma receta; tiene preentrenamiento difusivo | Apache-2.0 | Hugging Face |
| Qwen2.5-1.5B + la misma receta | 1,5B | no disponible en la información | Pérdida de validación 0,714 | qwen-research | No publicado como adaptador en la información disponible |
| Rami/fast-dllm-v2-1.5b-vgc-regmb-lora (writer anterior del proyecto) | 1,5B | no disponible | ~50 % de equipos legales con objetivo `unknown` | no disponible en la información | Hugging Face |

## Limitaciones y advertencias

- Legalidad limitada: aproximadamente el 50 % de las muestras no pasan el validador de Showdown. Los fallos típicos son formas inventadas (`Alcremie-Mega`), violaciones de Item Clause y movimientos o habilidades incompatibles con la especie.
- La salida omite Stat Points y niveles por diseño; hay que añadir los spreads a mano y validar el equipo en Showdown antes de cualquier uso real.
- Riesgo de alucinación estructural: el modelo genera especies, objetos y movimientos plausibles pero inexistentes o ilegales en el formato; no debe usarse como fuente de verdad sobre el metajuego.
- Sin preentrenamiento difusivo: el checkpoint de 3B solo recibió este fine-tune como entrenamiento de difusión, lo que lo sitúa ligeramente por debajo de Fast-dLLM v2 1.5B en pérdida de validación (0,682 frente a 0,667).
- Dominio e idioma únicos: solo formato `gen9championsvgc2026regmb` y solo inglés. No es un modelo de propósito general ni un chat.
- Restricciones de licencia: Qwen Research License Agreement, solo investigación y evaluación; el uso comercial está prohibido. Cualquier producto derivado requiere otra base con licencia permisiva.
- Muestreador publicado: procesa solo la primera fila y se detiene en el primer token de parada, por lo que escribe un equipo por llamada; para volumen hay que usar `generate_batch`.
- Umbral de confianza bajo en lote: bajar de 0,9 no mejora el throughput porque cada paso sincroniza con la fila menos confiada.
- Sin cifras de benchmarks estándar (MMLU, HumanEval, GSM8K) ni evaluaciones de sesgo; no hay datos sobre comportamiento fuera del dominio de equipos VGC.
- Licencia y modelo base: el adaptador hereda las limitaciones de Qwen2.5-3B-Instruct, incluidos los sesgos del corpus original, no evaluados en esta ficha.

## Enlaces

- Repositorio del adaptador en Hugging Face: https://huggingface.co/Rami/qwen2.5-3b-block-diffusion-vgc-regmb-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base (Qwen Research License Agreement): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Fast-dLLM v2 1.5B (arquitectura y pérdida, Apache-2.0): https://huggingface.co/Efficient-Large-Model/Fast_dLLM_v2_1.5B
- Writer anterior del proyecto (1,5B): https://huggingface.co/Rami/fast-dllm-v2-1.5b-vgc-regmb-lora
- Proyecto Battle Factory of Porygon-Pi: https://github.com/Rami-Ismael/Battle-Factory-of-Porygon-Pi
- Script de carga y muestreo: `load_vgc_writer.py` dentro del repositorio de Hugging Face
- Nota: la búsqueda web realizada no devolvió enlaces relevantes al modelo; los resultados correspondían al juego de cartas Rami y se han descartado.
