# Gaurav-27/hindi-stt-rover-p3

## Resumen

Hindi STT: ROVER-P3 es un sistema de reconocimiento automatico del habla en hindi construido por combinacion de sistemas (system combination), no una red neuronal unica. Cuatro reconocedores de voz en hindi transcriben el mismo audio y sus salidas se fusionan palabra a palabra mediante ROVER (recogniser output voting error reduction). El repositorio aloja el unico miembro entrenado por el autor, E6-WiSE, junto con la receta y el codigo exactos para reconstruir la combinacion; los otros tres miembros son modelos publicos referenciados, no copiados.

El modelo lo desarrolla el usuario Gaurav-27 y se publica como hito (snapshot de 23 de noviembre de 2026). Segun la propia model card, queda superado por la "R1 v2 soup" (repositorio separado), que funciona mejor como modelo unico en todos los conjuntos de prueba, por lo que ROVER-P3 se conserva unicamente como referencia historica.

La relevancia tecnica esta en su enfoque: en lugar de perseguir un unico modelo mayor, combina familias arquitectonicas distintas (Whisper, FastConformer con TDT, Conformer con RNNT) para reducir el error mediante votacion. E6-WiSE se construye a partir de Trelis/tara (un fine-tune de Whisper-large-v3) mediante un ajuste completo y posterior interpolacion de pesos WiSE-FT. El sistema esta orientado exclusivamente al hindi y procesa clips de hasta 30 segundos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Combinacion de sistemas (ROVER) sobre cuatro reconocedores: Whisper (Tara y E6-WiSE), FastConformer + TDT (SraVaani), Conformer + RNNT (IndicConformer) |
| Parametros totales | no disponible (E6-WiSE deriva de Whisper-large-v3; no se detalla el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | clips de audio de hasta 30 s (ventana de Whisper); sin chunking para audio largo |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hindi (hi) |
| Licencia | other / mixed-see-card (terminos mixtos; E6-WiSE hereda las condiciones de sus datos de entrenamiento, con GramVaani restringido a uso academico) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

ROVER-P3 no es una red unica sino un pipeline de combinacion. Cuatro sistemas transcriben el mismo audio y un modulo ROVER alinea y vota palabra a palabra. Los miembros se agrupan por familia para el voto: los dos modelos Whisper (Tara y E6-WiSE) comparten la mayor parte de sus errores y por ello dividen un unico voto de familia, mientras que SraVaani (FastConformer + TDT) e IndicConformer (Conformer + RNNT) aportan votos con peso 0.5 cada uno. Los pesos se ajustaron sobre el conjunto de desarrollo y solo ganaron 0.08 WER (por debajo de la resolucion de 0.15 del autor), de modo que los pesos de familia quedan iguales. La receta esta en `rover_p3.json`.

E6-WiSE se entrena en dos fases. Primero, "E6": Tara se ajusta completamente durante 5.785 pasos de tamano de lote 32 con lr 5e-6 (AdamW, warm-up de 200 pasos, SpecAugment con p 0.05) sobre Kathbath, GramVaani 100 h, MUCS 2021 Hindi, IndicTTS Hindi y FLEURS Hindi, con pesos de mezcla 0.8 / 1.5 / 0.4 / 1.0 / 3.0 respectivamente. Despues se aplica WiSE-FT, interpolando pesos: theta = 0.5·theta_Tara + 0.5·theta_E6, sin entrenamiento adicional. La decodificacion de todos los miembros es greedy.

## Capacidades

- Reconocimiento automatico del habla (transcripcion) en hindi, con salida de texto a partir de audio.
- Combinacion de cuatro sistemas heterogeneos para reducir el error mediante votacion ROVER.
- Procesamiento de audio de telefonia de 8 kHz y de audio de lectura, segun los conjuntos evaluados (Monsoon, Lahaja, Vaani-Bench, Vistaar).
- Reproducibilidad completa: incluye codigo de decodificacion por miembro, script de combinacion y hashes de codigo revisados (pins) que impiden ejecutar codigo remoto modificado.
- No se documentan capacidades de tool calling, agentes, vision, audio generativo ni modo de razonamiento (thinking).

## Casos de uso

- Transcripcion de audio de telefonia en hindi: el sistema esta evaluado sobre GramVaani (audio de llamadas) y combina miembros que mitigan errores en audio de 8 kHz; util para digitalizar conversaciones de call center en hindi.
- Investigacion en combinacion de sistemas ASR: el repositorio incluye la receta ROVER y los scripts de decodificacion, lo que permite reproducir y comparar estrategias de votacion entre familias de modelos.
- Generacion de transcripciones de referencia para corpus en hindi: la combinacion reduce el WER frente a cada miembro individual en los conjuntos evaluados, lo que la hace util para anotacion asistida.
- Benchmarking de ASR en hindi: sirve como linea base multi-sistema para comparar modelos nuevos contra una combinacion consolidada.
- Prototipado de pipelines ASR multimiembro: el codigo permite sustituir o anadir miembros y medir el impacto en WER sobre los conjuntos de desarrollo.
- Evaluacion de robustez entre dominios: al cubrir audio de lectura y conversacional, permite analizar la degradacion del rendimiento al pasar de un dominio a otro.

## Benchmarks y rendimiento

Resultados de WER (%) segun la model card; menor es mejor. Una lectura de test por sistema, decisiones tomadas solo sobre desarrollo.

| Conjunto | ROVER-P3 | E6-WiSE solo | Tara |
|---|---:|---:|---:|
| Monsoon (lattice; aproxima OIWER, mas estricto que el scorer oficial) | 12.86 | 14.68 | 14.41 |
| Lahaja (estricto) | 11.06 | 15.46 | 15.24 |
| Vaani-Bench (mejor de 3 referencias) | 11.11 | 12.13 | 12.36 |
| Vistaar media de 6 conjuntos (estricto, sin IndicTTS) | no disponible | 12.03 | 12.47 |

Resultados en desarrollo (WER %): Kathbath 7.90, GramVaani call-disjoint 18.75, Vaani 16.35, IndicVoices 12.76. El fichero `results.json` contiene cada cifra con su scorer; se usa el protocolo Vistaar (normalizador de AI4Bharat) en todas las evaluaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio ocupa 3,1 GB, lo que sugiere pesos en precision reducida para E6-WiSE; la combinacion completa requiere cargar simultaneamente los cuatro miembros (dos Whisper-large-v3, SraVaani e IndicConformer de 600 M), lo que eleva el requisito muy por encima de un unico modelo.
- GPU recomendadas: no especificadas en la informacion disponible. Por el tamano de los miembros Whisper-large-v3, se requiere GPU con VRAM suficiente para cargar varios modelos a la vez; no se confirman modelos concretos (A100, H100, RTX 4090).
- Compatibilidad con GPU de consumo: no confirmada; la combinacion de cuatro sistemas concurrentes probablemente excede la VRAM de GPU de consumo, aunque no hay dato oficial.
- Opciones de despliegue: scripts propios del repositorio (`code/scripts/run_baseline_hf.py` y `code/scripts/rover_combine.py`) sobre torch y transformers; requiere soundfile, sentencepiece, onnxruntime (IndicConformer) e indic-nlp-library (normalizador Vistaar). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | WER (referencia) | Licencia |
|---|---|---|---|---|---|
| ROVER-P3 (este) | Combinacion ROVER de 4 sistemas | no disponible | clips de 30 s | Monsoon 12.86, Lahaja 11.06, Vaani-Bench 11.11 | other / mixed-see-card |
| E6-WiSE (miembro) | Whisper-large-v3 con WiSE-FT | no disponible | clips de 30 s | Monsoon 14.68, Lahaja 15.46, Vaani-Bench 12.13 | hereda terminos de datos (GramVaani academico) |
| Trelis/tara | Whisper-large-v3 fine-tune | no disponible | clips de 30 s | Monsoon 14.41, Lahaja 15.24, Vaani-Bench 12.36 | Apache-2.0 |
| SraVaani-1.0 | FastConformer + TDT | no disponible | no disponible | no disponible en esta ficha | MIT |
| IndicConformer 600M | Conformer + RNNT | 600 M | no disponible | no disponible en esta ficha | MIT (gated) |

## Limitaciones y advertencias

- E6 se entreno sobre transcripciones originales de GramVaani que posteriormente se descubrieron corruptas (por ejemplo, se sustituye "से" por "ऐसी", "पर" por "आरोप", "मैं" por "मई" por fila). En audio telefonico de 8 kHz, E6-WiSE puede escribir "ऐसी" en lugar de "से"; el voto de ROVER oculta la mayor parte, pero el defecto persiste. Los modelos entrenados tras la correccion (R1 v2 soup) no lo tienen.
- Las ganancias en habla de lectura no se trasladan a conversacion: E6-WiSE queda ligeramente por detras de Tara en Monsoon y Lahaja.
- Solo procesa clips de hasta 30 s (ventana de Whisper); no incluye chunking para audio de larga duracion.
- Modelo superado por el R1 v2 soup, que es mejor como modelo unico en todos los conjuntos de prueba; ROVER-P3 se conserva como hito.
- Restricciones de licencia: el corpus GramVaani 100 h esta licenciado solo para uso academico; el uso de estos pesos debe respetar esa condicion. Deben comprobarse los terminos de Kathbath, MUCS 2021, IndicTTS y FLEURS antes de cualquier uso comercial.
- IndicConformer esta restringido (gated) en Hugging Face, lo que anade un paso de autorizacion para reconstruir la combinacion.
- No se documentan sesgos especificos ni tasas de alucinacion; al ser ASR, el riesgo principal es la sustitucion erronea de palabras, evidenciado en la limitacion de GramVaani.
- Cobertura limitada al hindi; no se declaran otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gaurav-27/hindi-stt-rover-p3
- Modelo base (Tara): https://huggingface.co/Trelis/tara
- SraVaani-1.0: https://huggingface.co/ARTPARK-IISc/SraVaani-1.0
- IndicConformer 600M: https://huggingface.co/ai4bharat/indic-conformer-600m-multilingual
