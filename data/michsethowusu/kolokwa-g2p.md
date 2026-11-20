# michsethowusu/kolokwa-g2p

## Resumen

Kolokwa G2P es un modelo de conversión grafema-a-fonema (G2P) especializado en inglés liberiano y kolokwa, la lengua criolla de base inglesa hablada en Liberia. Lo desarrolla michsethowusu y se publica bajo licencia MIT. El modelo resuelve un problema concreto: los sistemas TTS y de reconocimiento fonético entrenados con inglés estándar producen transcripciones IPA incorrectas para las variedades lingüísticas de Liberia, que presentan reducción de líquidas en coda, monoptongación y fonología específica de palabras funcionales.

Técnicamente es un transformer forward no autorregresivo de 6 capas, con dimensión oculta de 512, dimensión feed-forward de 1024 y 4 cabezas de atención. Ocupa aproximadamente 59 MB y sigue la arquitectura DeepPhonemizer implementada en la librería `arcosoph/phonemize`. Su velocidad de inferencia declarada es de unas 98.000 palabras por segundo en GPU y 25.000 en CPU, lo que lo hace apto para preprocesado fonético a gran escala en pipelines de síntesis de voz.

Su relevancia actual radica en la escasez de recursos fonéticos para variedades africanas del inglés. El modelo se entrenó sobre 13.353 entradas de un léxico de pronunciación liberiano, extraídas de 58.897 enunciados de habla kolokwa alineados, y se integra en el proyecto de corpus de habla inglés-liberiano del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer forward no autorregresivo (DeepPhonemizer), 6 capas |
| Parametros totales | no disponible (tamano del modelo ~59 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `best_model.pt`) |
| Idiomas soportados | en (inglés liberiano), kqr (kolokwa); código interno `en_lr` |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (`.pt`) |

## Arquitectura y entrenamiento

El modelo es un transformer forward de 6 capas con `d_model` de 512, `d_fft` de 1024 y 4 cabezas de atención, implementado sobre la arquitectura DeepPhonemizer de la librería `arcosoph/phonemize`. Al ser no autorregresivo, predice la secuencia completa de fonemas en una sola pasada, lo que explica su alto throughput (98.000 palabras/s en GPU, 25.000 en CPU) frente a alternativas autorregresivas.

El entrenamiento se realizó sobre 13.353 entradas de léxico de pronunciación liberiano filtradas por ruido, extraídas de 58.897 enunciados de habla kolokwa alineados del corpus `michsethowusu/liberian-english-speech`. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (poco probables en un modelo G2P). La innovación principal es la captura de patrones fonológicos auténticos del inglés liberiano: reducción de líquidas en coda (*water* → `[wɔt]`), monoptongación (*cold* → `[ko]`, *dey* → `[de]`) y fonología específica de palabras funcionales (*people* → `[pəl]`).

## Capacidades

- Conversión grafema-a-fonema (G2P) a IPA para inglés liberiano y kolokwa.
- Fonemización rápida no autorregresiva, apta para procesado por lotes a gran escala.
- Captura de rasgos fonológicos dialectales: reducción de líquidas en coda, monoptongación, nasalización vocálica y reducción de palabras funcionales.
- Integración directa con pipelines TTS mediante la librería `phonemize`.
- Soporte de dos códigos de idioma: `en` y `kqr` (uso interno `en_lr`).
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento; es un componente fonético especializado.

## Casos de uso

- Síntesis de voz (TTS) para inglés liberiano: el modelo genera la secuencia IPA que alimenta un sintetizador acústico, permitiendo voces TTS con pronunciación auténtica de Liberia en lugar de inglés estándar.
- Síntesis de voz en kolokwa: aplicación directa en asistentes de voz y lectores de pantalla para hablantes de la lengua criolla, un nicho sin cobertura en modelos G2P genéricos.
- Preprocesado de corpus de habla: fonemización masiva de transcripciones para alinear audio y texto en la construcción de corpus de habla liberiana, aprovechando su throughput de decenas de miles de palabras por segundo.
- Sistemas de pronunciación asistida: herramientas de aprendizaje de idiomas o diccionarios de pronunciación que muestren la transcripción IPA real de palabras kolokwa.
- Investigación lingüística: análisis fonológico de variedades del inglés africano, comparación de patrones de reducción y monoptongación a partir de transcripciones sistemáticas.
- Evaluación de reconocimiento de voz: generación de transcripciones fonéticas de referencia para medir la precisión de sistemas ASR entrenados en inglés estándar sobre habla liberiana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente declara métricas de velocidad de inferencia (unas 98.000 palabras/s en GPU y 25.000 en CPU) y ejemplos cualitativos de salida, sin valores de error de fonema (PER) ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint ocupa unos 59 MB y la arquitectura es de 6 capas con `d_model` 512.
- GPU recomendadas: cualquier GPU con más de 1 GB de VRAM es suficiente; no requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada moderna puede ejecutarlo.
- Cabe en cualquier GPU de consumo e incluso en CPU: la model card declara 25.000 palabras/s en CPU.
- Opciones de despliegue: librería `phonemize` (`Phonemizer.from_checkpoint`) con pesos descargados vía `huggingface_hub`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: ~98.000 palabras/s en GPU y ~25.000 palabras/s en CPU según el autor.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kolokwa G2P | G2P transformer forward (DeepPhonemizer) | en (liberiano), kqr | ~59 MB | MIT | Hugging Face |
| DeepPhonemizer (genérico) | G2P transformer (referencia de arquitectura) | múltiples | variable | MIT | GitHub |
| eSpeak NG | G2P basado en reglas | múltiples | ~MB | GPL | Repositorio público |
| G2P genéricos de inglés estándar | G2P neuronal o basado en reglas | en estándar | variable | variable | Hugging Face / repositorios |

No se dispone de comparaciones cuantitativas de rendimiento (PER) entre estos modelos en la información proporcionada; la comparativa se limita a características estructurales y de licencia.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en G2P: no genera texto, no razona y no responde a instrucciones; no debe evaluarse como un LLM.
- Cobertura limitada a inglés liberiano y kolokwa; su uso sobre otras variedades del inglés producirá transcripciones fonéticas inexactas.
- Entrenado sobre 13.353 entradas de léxico: el vocabulario fuera de ese léxico puede fonemizarse de forma inconsistente.
- Riesgo de error en palabras poco frecuentes, nombres propios y préstamos léxicos no representados en el corpus.
- No se documentan sesgos demográficos ni geográficos dentro de Liberia; la variabilidad dialectal interna puede no estar cubierta.
- Licencia MIT: permite uso comercial sin restricciones, pero no se ofrece garantía alguna sobre la precisión fonética en producción.
- Los pesos se distribuyen en formato PyTorch (`.pt`), lo que requiere la librería `phonemize` para su carga; no hay conversión a GGUF ni a otros formatos.
- No se documenta la longitud máxima de secuencia de entrada; textos muy largos podrían requerir segmentación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/michsethowusu/kolokwa-g2p
- Dataset de texto-IPA kolokwa: https://huggingface.co/datasets/michsethowusu/kolokwa-text-ipa
- Corpus de habla inglés-liberiano: https://huggingface.co/datasets/michsethowusu/liberian-english-speech
- Librería `arcosoph/phonemize`: https://github.com/arcosoph/phonemize
