# Sido/makellm-ja-char-200m

## Resumen

makellm-ja-char-200m es un modelo de lenguaje japones entrenado desde cero (from scratch) por Tsutomu Uchida (usuario Sido en Hugging Face). Se trata de un transformer decoder-only de estilo GPT-2 con tokenizacion a nivel de caracter, es decir, sin BPE ni subword tokenizer: cada token corresponde a un unico caracter Unicode. Cuenta con 209.520.640 parametros (unos 210M) y una ventana de contexto de 512 caracteres.

El modelo se entrena sobre un corpus japones de aproximadamente 6.170 millones de caracteres procedente de Wikipedia en japones, Aozora Bunko y CC-100 japones. Es un modelo base, no ajustado a instrucciones, pensado para continuacion de texto y como punto de partida para fine-tuning. Su interes reside en la transparencia del proceso: entrenamiento completo en hardware de consumo (una APU AMD Ryzen AI MAX+ 395 con iGPU Radeon 8060S bajo ROCm), sin pesos preentrenados ni tokenizer externo.

La relevancia actual es principalmente educativa y de investigacion: demuestra hasta donde llega un LM japones pequeno y completamente autocontenido en una sola APU de consumo. El autor reconoce explicitamente que el modelo esta infraentrenado respecto a su tamano (solo ~0.41B tokens vistos frente a un presupuesto optimo de Chinchilla), por lo que su calidad refleja el presupuesto de computo disponible, no el techo de la arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only Transformer (estilo GPT-2), a nivel de caracter |
| Parametros totales | 209.520.640 (~210M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (= 512 caracteres) |
| Tipos de cuantizacion | no disponible (el repo incluye pesos GGUF; no se detallan los niveles concretos) |
| Idiomas soportados | japones (ja) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | GGUF (libreria gguf); el entrenamiento original uso fp32 |
| Capas (n_layer) | 16 |
| Dimension de embedding (n_embd) | 1024 |
| Cabezas de atencion (n_head) | 16 (dimension por cabeza 64) |
| Vocabulario | 7.280 (nivel de caracter) |
| Codificacion posicional | absoluta aprendida |
| Normalizacion | pre-LayerNorm |
| MLP | 4x oculto (1024 → 4096 → 1024), GELU |
| Weight tying | embedding de tokens ↔ cabeza de salida |
| Precision de entrenamiento | fp32 |
| Implementacion de atencion | eager (equivalente matematicamente a SDPA) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estandar de estilo GPT-2 con 16 capas, dimension de embedding 1024, 16 cabezas de atencion de dimension 64, MLP con factor de expansion 4x y activacion GELU, pre-LayerNorm y weight tying entre el embedding de tokens y la cabeza de salida. La inicializacion escala las proyecciones residuales por 1/sqrt(2·n_layer). La implementacion es un `model.py` compacto de unas 250 lineas, de linaje nanoGPT, sin libreria de modelado externa. La atencion se implementa de forma eager (matematicamente equivalente a SDPA).

La tokenizacion es a nivel de caracter: el vocabulario son los 7.280 caracteres distintos del corpus (kana, kanji, ASCII y simbolos comunes), sin ningun paso de BPE o merging de subpalabras. El corpus de preentrenamiento tiene ~6.170 millones de caracteres (train ≈ 5.55B / validacion ≈ 0.617B) y se compone de Wikipedia en japones, Aozora Bunko (literatura de dominio publico) y CC-100 japones. El pipeline de limpieza aplica normalizacion Unicode NFKC, elimina puntos de codigo de categorias Cc/Cf/Co/Cn (~963k puntos eliminados del mapa) y retira fragmentos corruptos y ruido de boilerplate tipico de crawls web. El corpus se almacena como binarios `uint16` de ids de caracter.

El entrenamiento uso objetivo de prediccion del siguiente caracter (entropia cruzada), optimizador AdamW con lr = 3e-4 constante, gradient clipping de 1.0, batch de 16 secuencias de 512 tokens, 50.000 iteraciones, dropout 0.1, precision fp32 y semilla 1337. Se ejecuto en una APU AMD Ryzen AI MAX+ 395 con iGPU Radeon 8060S (gfx1151, RDNA 3.5) bajo PyTorch ROCm, con un tiempo de reloj de ~90 horas. La perdida de validacion final fue 2.0180 (entropia cruzada a nivel de caracter). El autor senala que, con 50.000 pasos de 8.192 tokens, el modelo solo vio ~0.41B tokens, muy por debajo de un presupuesto optimo de Chinchilla para 200M de parametros, por lo que esta deliberadamente infraentrenado.

## Capacidades

- Generacion y continuacion de texto en japones a nivel de caracter (prediccion del siguiente caracter).
- Modelo base: completa texto coherente a corto plazo, sin seguir instrucciones de forma fiable.
- Sin dependencia de tokenizer BPE: procesa texto japones crudo caracter a caracter, sin artefactos de merging ni problemas de OOV en caracteres del vocabulario.
- Capacidad de fine-tuning como base para chat o adaptacion de dominio (el autor publica variantes chat: JK persona y neutral adult).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al japones (entrenado solo en ja); no se documenta soporte de otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Despliegue compatible con Ollama y llama.cpp (etiquetas del repo), y endpoints compatibles.

## Casos de uso

- Continuacion de texto japones en aplicaciones creativas: dado un fragmento inicial en japones, el modelo genera continuaciones a nivel de caracter; adecuado para prototipos de escritura asistida donde la coherencia a corto plazo (hasta 512 caracteres de contexto) sea suficiente.
- Fine-tuning para chat o asistentes de dominio: al ser un modelo base, sirve como punto de partida para ajuste supervisado con datos propios; el autor ya publica variantes chat, lo que demuestra la viabilidad del flujo.
- Investigacion y educacion en NLP japones: su transparencia total (codigo de ~250 lineas, vocabulario derivado del corpus, entrenamiento reproducible en una APU de consumo) lo hace util para ensenar el ciclo completo de entrenamiento de un LM.
- Experimentos de tokenizacion a nivel de caracter: permite estudiar el comportamiento de modelos sin BPE en japones, comparando longitud de secuencia, perdida por caracter y calidad frente a modelos con subword tokenization.
- Despliegue ligero en entornos con recursos limitados: con ~210M de parametros y pesos GGUF en un repo de 0.4 GB, puede ejecutarse en CPU o iGPU via llama.cpp u Ollama para demos y pruebas de inferencia local.
- Generacion de texto literario o de estilo Aozora: al haberse entrenado con literatura de dominio publico, puede emplearse en experimentos de imitacion de estilo o generacion de texto con registro literario japones.
- Pruebas de pipelines de datos japoneses: el pipeline de limpieza (NFKC, filtrado de categorias Unicode, construccion de vocabulario) puede reutilizarse como referencia para preparar corpus japoneses en otros proyectos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la perdida de validacion final de 2.0180 (entropia cruzada a nivel de caracter) tras 50.000 iteraciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con ~210M de parametros, los pesos en fp32 ocupan ~0.87 GB; en cuantizaciones de 8 bits o 4 bits el requisito seria considerablemente menor (el repo GGUF ocupa 0.4 GB).
- GPU recomendadas: el modelo se entreno en una iGPU Radeon 8060S (APU AMD Ryzen AI MAX+ 395) bajo ROCm; para inferencia no se especifican GPU dedicadas.
- Cabe en GPU de consumo: si, por su tamano (~210M de parametros) es apto para GPU de consumo e incluso para ejecucion en CPU; no se detallan modelos concretos.
- Opciones de despliegue: llama.cpp, Ollama (etiquetas del repo), endpoints compatibles; el formato GGUF facilita estos despliegues.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables en la informacion proporcionada. A continuacion se comparan caracteristicas estructurales con alternativas de la misma categoria (modelos japoneses pequenos de ~100-200M de parametros), indicando "no disponible" donde no hay datos.

| Modelo | Parametros | Contexto | Tokenizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| makellm-ja-char-200m | ~210M | 512 caracteres | caracter (sin BPE) | CC BY-SA 4.0 | GGUF en Hugging Face |
| makellm-ja-char-75m-chat (mismo autor) | 82.2M | no disponible | caracter | no disponible | Hugging Face |
| Alternativas japonesas de ~200M con BPE | no disponible | no disponible | subword (BPE) | no disponible | no disponible |

No se han identificado en la informacion disponible modelos comparables con datos de rendimiento publicados; la comparacion cuantitativa de benchmarks queda pendiente.

## Limitaciones y advertencias

- No esta ajustado a instrucciones: es un modelo base y no funcionara de forma fiable como asistente conversacional ni seguira ordenes.
- Infraentrenado respecto a su tamano: solo vio ~0.41B tokens frente a un presupuesto optimo de Chinchilla para 200M de parametros; la precision factual y la coherencia de largo alcance son limitadas.
- Contexto corto: 512 caracteres de ventana, insuficiente para tareas que requieran documentos largos o conversaciones multi-turno extensas.
- Generacion a nivel de caracter: puede producir ocasionalmente no-palabras o deriva en el texto generado.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse con web, enciclopedias y literatura, puede heredar sesgos de esas fuentes.
- Riesgo de alucinacion: elevado por su tamano reducido y su infraentrenamiento; no debe usarse como fuente de hechos sin verificacion.
- Limitacion de idioma: entrenado exclusivamente en japones; no se garantiza un comportamiento correcto en otros idiomas.
- Licencia CC BY-SA 4.0: permite uso comercial con atribucion y compartir-al-igual; las obras derivadas deben distribuirse bajo la misma licencia, lo que puede condicionar productos propietarios.
- Caveat para produccion: los pesos publicados estan en GGUF; no se detallan los niveles de cuantizacion disponibles ni metricas de calidad por cuantizacion, por lo que conviene validar el rendimiento real antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sido/makellm-ja-char-200m
- Perfil del autor en Hugging Face: https://huggingface.co/Sido
- Modelos del autor: https://huggingface.co/Sido/models
- Variante chat (JK persona): https://huggingface.co/Sido/makellm-ja-char-200m-chat
- Variante chat (neutral adult): https://huggingface.co/Sido/makellm-ja-char-200m-normal-chat
- Dataset CC-100 japones: https://huggingface.co/datasets/range3/cc100-ja
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset Aozora Bunko: https://huggingface.co/datasets/globis-university/aozorabunko-clean
