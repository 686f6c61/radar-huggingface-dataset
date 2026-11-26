# OykuNehir/puppet-studio-qwen3.5-2b-lora

## Resumen

Puppet Studio es un conjunto de tres adaptadores LoRA (más una conversión GGUF) entrenados sobre el modelo base Qwen/Qwen3.5-2B para alimentar una herramienta local que convierte un guion de narración en un vídeo explicativo con marionetas animadas. El desarrollo corre a cargo de OykuNehir y forma parte del proyecto Kukla Animasyon, cuyo objetivo es que todo el pipeline (generación de escenas, dibujo de fondos y selección de poses) se ejecute en local sobre hardware de consumo. Cada adaptador resuelve una subtarea concreta: segmentación del guion en escenas con pose y texto de pizarra (`scenes-v1`), generación de fondos en un pequeño lenguaje JSON de dibujo (`visual-v1`) y clasificación de pose a partir de una frase (`lora-v1`).

Los adaptadores se entrenaron con QLoRA sobre una única GPU de portátil (NVIDIA RTX 3060, 6 GB), con el modelo base cuantizado en 4 bits NF4, rango 16, alpha 32 y dropout 0.05 en todas las capas lineales del modelo de lenguaje. El resultado son 16.819.200 parámetros entrenables por adaptador, un repo de 1,5 GB que incluye pesos safetensors, la versión GGUF Q4_K_M del base (1,27 GB) y los adaptadores convertidos (34 MB cada uno). La licencia Apache 2.0 y el soporte de llama.cpp lo hacen utilizable tanto en Python con PEFT como en modo navegador mediante llama.cpp server.

Es relevante ahora porque demuestra un flujo de fine-tuning especializado en hardware de consumo para una tarea de producción de vídeo estructurada, con métricas sobre datos de test retenidos y comparaciones frente a reglas heurísticas y al modelo base sin entrenar. No es un modelo de propósito general ni un candidato para producción a gran escala: es una referencia práctica de adaptación de bajo coste sobre un transformer denso de 2B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.5-2B) con adaptadores LoRA sobre capas lineales; el base incluye capas SSM (`ssm_beta`/`ssm_alpha`) y atención con `attn_qkv`/`attn_gate` según el layout de conversión de llama.cpp |
| Parámetros totales | 16.819.200 parámetros entrenables por adaptador (dato real de safetensors); el modelo base Qwen3.5-2B no reporta cifra exacta en la información disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Base en 4-bit NF4 durante el entrenamiento (QLoRA); GGUF Q4_K_M para llama.cpp (1,27 GB, dividido en partes menores de 512 MB); adaptadores GGUF de 34 MB |
| Idiomas soportados | inglés (guiones en inglés únicamente) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT) y GGUF (base Q4_K_M y adaptadores) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-2B, un transformer denso de aproximadamente 2B parámetros con atención y componentes SSM (el layout GGUF conserva `attn_qkv`, `attn_gate`, `ssm_beta` y `ssm_alpha` como tensores separados). Sobre él se aplican tres adaptadores LoRA de rango 16, alpha 32 y dropout 0.05 en todas las capas lineales, con 16,8 M parámetros entrenables cada uno, learning rate 2e-4, batch 8 y el base cuantizado en 4 bits NF4. `scenes-v1` se entrenó 2 epochs sobre 270 guiones (+30 de validación) en 46 minutos; `visual-v1`, 2 epochs sobre 270 escenas (+30) en 13,8 horas; y `lora-v1`, 3 epochs sobre 511 frases (+56) en 23 minutos. En `scenes-v1` y `visual-v1` la pérdida se calcula solo sobre los tokens de respuesta; en `lora-v1`, sobre los cinco logits de nombre de pose.

La innovación principal no está en la arquitectura sino en la especialización: cada adaptador solo funciona con el prompt exacto con el que fue entrenado, renderizado con la plantilla de chat y `enable_thinking=False`, y decodificado de forma greedy. Los datos de entrenamiento son sintéticos y escritos para el proyecto (empresas, personas y guiones ficticios), lo que acota el dominio pero también limita la generalización. La conversión GGUF se realizó con llama.cpp `7d7f028` (2026-11-08); versiones posteriores fusionan los tensores `attn_qkv`/`attn_gate` y `ssm_beta`/`ssm_alpha`, por lo que requieren reconversión.

## Capacidades

- Generación de texto estructurado: salida de escenas en JSON a partir de un guion completo (cortes, pose de la marioneta, texto de pizarra).
- Generación de dibujos en un lenguaje JSON de dibujo reducido: fondos de escena (papel, cielo, noche) e ítems con tipos y reglas de composición.
- Clasificación de pose a partir de una frase: cinco clases (explain, point, laugh, think, celebrate).
- Preservación de números y negaciones en el texto de pizarra (con debilidades documentadas en negaciones).
- Ejecución local en hardware de consumo, incluido modo navegador vía llama.cpp server con carga de ambos adaptadores y selección por petición mediante `"lora": [{"id": 0, "scale": 1}, {"id": 1, "scale": 0}]`.
- No dispone de tool calling, function calling, capacidades de agente multi-paso, visión, audio ni modo de razonamiento explícito (thinking desactivado por diseño).
- Capacidades multilingües: limitadas al inglés; no se reporta soporte de otros idiomas.

## Casos de uso

- Generación automática de guiones gráficos para vídeo explicativo: el adaptador `scenes-v1` recibe un guion de narración y devuelve las escenas con cortes, pose y texto de pizarra, con F1 de 91,3 % en cortes sobre datos retenidos; adecuado para pipelines internos de creación de contenido formativo.
- Dibujo procedural de fondos: `visual-v1` transforma la narración de una escena en un JSON de dibujo que un renderizador 2D puede consumir directamente, con 93 % de ítems que cumplen todas las reglas y 92,5 % de acierto en el fondo.
- Selección de pose en animación de marionetas: `lora-v1` clasifica una frase en una de cinco poses con 100 % en 75 frases de test y 89 % en 97 frases difíciles, útil como paso de preprocesado en herramientas de animación.
- Prototipado de fine-tuning en hardware de consumo: sirve como referencia reproducible (QLoRA, rango 16, 6 GB de VRAM) para equipos que quieran adaptar un modelo de 2B a una tarea estructurada con menos de una hora de entrenamiento en el caso de `scenes-v1`.
- Despliegue en navegador o en entornos sin GPU dedicada: la conversión GGUF Q4_K_M (1,27 GB) con adaptadores de 34 MB permite ejecutar el Studio en modo navegador mediante llama.cpp server, con selección de adaptador por petición.
- Generación de material didáctico con preservación de cifras: el adaptador `scenes-v1` mantiene 32 de 42 números en la pizarra (frente a 9/42 con reglas y 25/42 sin entrenamiento), lo que lo hace útil para vídeos con datos numéricos que deben aparecer en pantalla.
- Integración en pipelines de CI/CD de contenido: al ser determinista (decodificación greedy) y con prompts fijos, los resultados son reproducibles y verificables automáticamente contra un validador JSON, lo que facilita tests de regresión en la generación de escenas.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre datos de test retenidos, de temas no presentes en el entrenamiento.

`scenes-v1`, 40 guiones:

| Métrica | Reglas (antes) | Qwen3.5-2B sin entrenar | scenes-v1 |
|---|---|---|---|
| Respuestas válidas | 40/40 | 40/40 | 40/40 |
| Precisión de pose | 74,1 % | 57,0 % | 91,6 % |
| Cortes de escena, F1 | 87,4 % | 56,0 % | 91,3 % |
| Números conservados en pizarra | 9/42 | 25/42 | 32/42 |
| Negaciones conservadas en pizarra | 1/29 | 13/29 | 17/29 |

`visual-v1`, 40 escenas: 100 % de respuestas en JSON válido, 93 % de ítems dibujados que cumplen todas las reglas, 92,5 % de acierto en el fondo (papel, cielo, noche) y F1 de 86 % en tipos de ítem frente a la referencia.

`lora-v1`, poses para frases sueltas: 100 % en 75 frases de test y 89 % en 97 frases difíciles (negaciones, trampas de palabras clave, humor seco), frente a 64 % y 42 % sin entrenamiento y 93 % y 72 % con embeddings más regresión logística.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Entrenamiento: una NVIDIA RTX 3060 de 6 GB fue suficiente para los tres adaptadores con QLoRA (base en 4-bit NF4), con tiempos de 46 min, 13,8 h y 23 min respectivamente.
- Inferencia en precisión completa: el base Qwen3.5-2B en bfloat16 requiere aproximadamente 4-5 GB de VRAM para pesos, más overhead de contexto y activaciones; no se reporta cifra exacta.
- Inferencia GGUF Q4_K_M: 1,27 GB de pesos, apto para GPUs de consumo modestas y para CPU; los adaptadores añaden 34 MB cada uno.
- GPU recomendadas: RTX 3060 6 GB o superior para entrenamiento; para inferencia, cualquier GPU consumer con al menos 4 GB en cuantización 4 bits, o CPU en modo GGUF.
- Despliegue: transformers + PEFT (carga de adaptador por `subfolder`), llama.cpp server con campo `"lora"` para seleccionar adaptador por petición; no se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OykuNehir/puppet-studio-qwen3.5-2b-lora | 16,8 M entrenables por adaptador (base 2B) | no disponible | Tres LoRA especializados en generación de escenas, dibujo JSON y poses | Apache 2.0 | Hugging Face + GGUF |
| Qwen/Qwen3.5-2B (base) | ~2B | no disponible | Modelo de propósito general | no disponible en la información | Hugging Face |
| Reglas heurísticas del proyecto | 0 | no aplica | Segmentación y poses por reglas | no aplica | Código del repo |
| Embeddings + regresión logística | no disponible | no aplica | Clasificación de poses | no aplica | Código del repo |

Frente al base sin entrenar, los adaptadores mejoran pose (57,0 % → 91,6 %), cortes (56,0 % → 91,3 %), números (25/42 → 32/42) y negaciones (13/29 → 17/29) en `scenes-v1`; en `lora-v1` superan tanto al base (64 %/42 %) como al clasificador por embeddings (93 %/72 %) en frases difíciles (89 %). No se dispone de comparación con otros adaptadores LoRA públicos de la misma categoría.

## Limitaciones y advertencias

- Solo procesa guiones en inglés; no hay soporte multilingüe documentado.
- Cada adaptador funciona únicamente con el prompt exacto de entrenamiento, plantilla de chat y `enable_thinking=False`, decodificación greedy; desviarse del prompt degrada la salida.
- Debilidad conocida en `scenes-v1`: la negación "not" se pierde en la pizarra en 12 de 29 casos.
- Conjuntos de entrenamiento pequeños (270 guiones, 270 escenas, 511 frases); estilos atípicos (diálogo, listas largas, poesía) quedan fuera del dominio visto.
- Datos sintéticos con empresas, personas y guiones ficticios; riesgo de sobreajuste al estilo del proyecto y de alucinación fuera de dominio.
- No es un modelo de producción: el autor lo describe como demostración de fine-tuning local en hardware de consumo.
- La conversión GGUF depende de llama.cpp `7d7f028` (2026-11-08); versiones posteriores fusionan tensores y exigen reconversión.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni evaluación de sesgos; conviene auditar las salidas en producción.
- Sin soporte de tool calling, agentes multi-paso, visión o audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OykuNehir/puppet-studio-qwen3.5-2b-lora
- Repositorio del proyecto (Kukla Animasyon): https://github.com/oykunehir/kukla-animasyon
- Página de demos de Puppet Studio: https://puppet-studio.oykunehir.com/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
