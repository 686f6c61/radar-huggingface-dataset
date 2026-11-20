# juice500/hubert-6-phonemodel

## Resumen

hubert-6-phonemodel es un adaptador ligero (adapter) sobre el codificador auto-supervisado de voz facebook/hubert-large-ll60k, desarrollado por juice500, que resuelve dos tareas clasicas de la fonetica computacional: la segmentacion telefonica (localizar los limites entre fonos en una senal de voz) y el reconocimiento telefonico (asignar una etiqueta fonetica a cada segmento). En lugar de entrenar un clasificador de fonos opaco, el modelo aplica SPAM (S3M-based Phonological Activation Mapping), una tecnica que proyecta cada frame del codificador en un vector de 43 activaciones de rasgos fonologicos (sonoridad, nasalidad, stridencia, etc.) y a partir de ahi deriva segmentos y etiquetas interpretables.

El modelo es un unico punto de la rejilla encoder x capa del paper asociado: concretamente HuBERT-large en la capa 6, muestreado a 16 kHz. El autor indica explicitamente que este checkpoint no es el mejor de la familia y remite a juice500/wavlm-24-phonemodel para el mejor resultado. Se distribuye como adaptador sobre el modelo base, con licencia MIT, y se usa a traves de la libreria Python phonespam.

Su relevancia actual radica en que ofrece una via interpretable y ligera para tareas de analisis fonetico y alineamiento, con soporte para restringir el inventario de fonos a una lengua concreta mediante PHOIBLE. El alcance linguistico declarado es unicamente ingles y el dataset de referencia es TIMIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador SPAM sobre HuBERT-large (transformer auto-supervisado de voz); capa 6, 16 kHz |
| Parametros totales | no disponible (el adaptador se apoya en facebook/hubert-large-ll60k; el tamano del adaptador no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa utterances de voz; no se declara ventana) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0.0 GB; se carga via `PhoneModel.from_pretrained` de la libreria phonespam) |

## Arquitectura y entrenamiento

El modelo no es un transformer entrenado de cero, sino un adaptador sobre las representaciones congeladas (frozen) de un modelo auto-supervisado de voz (S3M), en concreto HuBERT-large. La innovacion central es SPAM: en lugar de predecir directamente clases de fonos, se mapea cada frame del codificador a un vector de 43 activaciones de rasgos fonologicos en el rango [0, 1], lo que convierte una representacion opaca en una interpretable. Sobre esa representacion operan dos cabezas: una de segmentacion (detecta cambios de fono) y otra de reconocimiento (asigna la etiqueta).

El entrenamiento se realizo sobre el dataset TIMIT (timit-asr/timit_asr) y el modelo se evalua en el paper "Phone Segmentation and Recognition through Phonological Activation Mapping" (SLT 2026). No se especifican en la informacion disponible el numero de tokens de audio, la composicion exacta del dataset ni si hubo etapas de RLHF/DPO (no aplicables a esta tarea). El checkpoint corresponde a un unico punto de la rejilla encoder x capa (HuBERT-large, capa 6); el autor senala que wavlm-24-phonemodel es el mejor modelo de la familia.

## Capacidades

- Segmentacion telefonica: devuelve segmentos contiguos con tiempos de inicio y fin en segundos.
- Reconocimiento telefonico: asigna una etiqueta fonetica a cada segmento.
- Representacion fonologica interpretable: expone la matriz SPAM de (frames, 43) activaciones en [0, 1] con nombres de rasgo (`spam.featnames`).
- Restriccion de inventario por lengua: `vocab_for_language` limita el reconocimiento al inventario PHOIBLE de una lengua (por ejemplo "deu").
- Procesamiento de audio a 16 kHz mediante el pipeline `transcribe`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de voz especializado, no un LLM.
- Capacidades multilingues limitadas: el modelo declara solo ingles, aunque permite restringir el vocabulario a inventarios de otras lenguas via PHOIBLE.

## Casos de uso

- Analisis fonetico e investigacion: extraer la matriz de 43 rasgos fonologicos por frame para estudiar correlaciones entre rasgos (sonoridad, nasalidad, stridencia) y senal acustica en corpus de habla.
- Alineamiento forzado aproximado: usar los segmentos devueltos por `transcribe` para obtener limites temporales entre fonos en utterances de ingles, util en anotacion semi-automatica de corpus.
- Preprocesado para sintesis de voz: generar etiquetas y duraciones telefonicas a partir de audio para entrenar o evaluar sistemas TTS.
- Docencia en fonetica y fonologia: visualizar activaciones de rasgos para explicar como un codificador auto-supervisado representa contrastes fonologicos.
- Prototipado de sistemas de reconocimiento de fonos: servir de baseline rapido (adaptador sobre HuBERT-large capa 6) antes de optar por el mejor checkpoint de la familia.
- Experimentos comparativos encoder x capa: al ser un punto concreto de la rejilla del paper, permite reproducir y comparar el efecto de la capa elegida frente a otros checkpoints del mismo autor.
- Restriccion a inventarios de otras lenguas: usar `vocab_for_language` para probar el reconocimiento sobre inventarios PHOIBLE distintos del ingles, con las cautelas del caso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al apoyarse en HuBERT-large (codificador de gran tamano) se requiere GPU para uso comodo, pero no se declaran cifras.
- GPU recomendadas: no disponible. El ejemplo de uso menciona `device="cuda"` para GPU, sin especificar modelos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: libreria Python `phonespam` (`pip install phonespam`), con API `PhoneModel.from_pretrained`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Capa | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| juice500/hubert-6-phonemodel | HuBERT-large | 6 | Segmentacion y reconocimiento de fonos | MIT | Punto de la rejilla; el autor lo califica como no el mejor |
| juice500/wavlm-24-phonemodel | WavLM | 24 | Segmentacion y reconocimiento de fonos | no disponible | Senalado por el autor como el mejor modelo de la familia |
| facebook/hubert-large-ll60k | HuBERT-large | - | Codificador auto-supervisado de voz | no disponible | Modelo base sobre el que se monta el adaptador |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El autor indica que este checkpoint no es el mejor de la familia; para resultados de referencia recomienda wavlm-24-phonemodel.
- Idioma declarado unicamente ingles; el uso con otras lenguas via PHOIBLE es una extension no validada en la model card.
- Entrenado sobre TIMIT, un corpus limitado en variedad de hablantes y condiciones acusticas; el rendimiento fuera de dominio no esta documentado.
- Riesgo de errores en los limites de segmentacion y en las etiquetas foneticas, especialmente en habla continua o ruidosa (no se aportan tasas de error).
- `vocab_for_language` descarga PHOIBLE 2.0 en tiempo de ejecucion, que es CC BY-SA 3.0 y se licencia por separado del modelo MIT; conviene revisar las obligaciones de esa licencia.
- No es un LLM: no soporta generacion de texto, tool calling, agentes ni razonamiento; no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- El repositorio figura con 0.0 GB y 0 descargas; no hay evidencia publica de uso en produccion.
- No se documentan sesgos especificos, pero al entrenar sobre TIMIT pueden aparecer sesgos de dominio (variedades de ingles y condiciones de grabacion del corpus).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/hubert-6-phonemodel
- Modelo base: https://huggingface.co/facebook/hubert-large-ll60k
- Mejor modelo de la familia: https://huggingface.co/juice500/wavlm-24-phonemodel
- Paper: https://arxiv.org/abs/2607.09020
- Codigo: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- PHOIBLE: https://phoible.org
- Dataset TIMIT: https://huggingface.co/datasets/timit-asr/timit_asr
