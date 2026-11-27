# Olicorne/parakeet-tdt-0.6b-v3-UltiMed-onnx

## Resumen

Parakeet TDT 0.6B v3 UltiMed ONNX es un ajuste fino especializado en dictado médico en francés del modelo `moondream/parakeet-ultra`, que a su vez es un post-entrenamiento en precisión completa de `nvidia/parakeet-tdt-0.6b-v3`. Lo desarrolla Olicorne, un autor independiente que mantiene el proyecto UltiMed, y resuelve un problema concreto: la transcripción automática de dictados clínicos en francés, donde los modelos ASR genéricos fallan sistemáticamente en nombres de fármacos y terminología médica.

El modelo parte de la arquitectura NeMo Conformer con decodificación TDT (Token-and-Duration Transducer) de NVIDIA, con aproximadamente 0,6 mil millones de parámetros, y se ha reentrenado sobre más de 3.000 horas de dictado médico francés del dataset `UltiMed-ASR-FR-v1`. El resultado se exporta a ONNX con varias precisiones del encoder en un mismo repositorio, pensado para inferencia en navegador y CPU mediante `onnx-asr` y la aplicación Parakeet Web.

Su relevancia actual radica en que ofrece una alternativa de código abierto (CC-BY-4.0) para un nicho poco cubierto, el ASR médico en francés, con mejoras medibles frente al modelo base: CER normalizado de 2,3 % frente a 4,9 % del base en el test de estrés con voz real, y 1,9 % al añadir phrase boosting y reglas de corrección de términos. Además, el autor mantiene una comparativa explícita con su propia v2, que recomienda no usar por regresiones en dictado humano real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | aproximadamente 0,6 mil millones (0,6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; se documenta una pasada única de 10 minutos de audio en VoxPopuli) |
| Tipos de cuantizacion | varias precisiones del encoder en carpetas separadas (fp32, y otras precisiones no detalladas en la informacion disponible) |
| Idiomas soportados | francés (fr) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (encoder dividido en `encoder-model.onnx.data.000` y `.data.001` para fp32) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `moondream/parakeet-ultra`, que a su vez deriva de `nvidia/parakeet-tdt-0.6b-v3`. La arquitectura es un Conformer de NeMo con decodificador TDT, un transductor que predice conjuntamente tokens y duraciones, lo que permite emisión variable por frame y buen comportamiento en audio largo. El punto de partida del entrenamiento fue la reconstrucción en NeMo de los pesos publicada en `Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx`, y el resultado se exportó a ONNX con múltiples precisiones del encoder en un único repositorio.

El entrenamiento se realizó sobre el dataset `Olicorne/UltiMed-ASR-FR-v1`, con más de 3.000 horas de dictado médico francés. La model card menciona conjuntos de evaluación que el modelo nunca vio durante el entrenamiento: el split de test del propio dataset (5.285 clips de términos del diccionario médico en frases de dictado), 2.498 clips de párrafos de informes hospitalarios PARHAF y 2.059 clips de fármacos. No se detallan en la información proporcionada el número exacto de tokens de audio, la composición completa del dataset ni si hubo etapas de RLHF o DPO; el pipeline es de ajuste supervisado sobre transcripciones.

Como innovación práctica, el proyecto incluye reglas de corrección por expresiones regulares (`regex-fixes/`) para nombres de fármacos y términos médicos que se aplican como sustitución de texto tras la decodificación, con coste casi nulo, y que también ayudan a modelos no ajustados. La exportación a ONNX está orientada a `onnx-asr` y a la app de navegador Parakeet Web, con inferencia completamente en cliente.

## Capacidades

- Reconocimiento automático de voz (ASR) en francés, con especialización en dictado médico.
- Transcripción de términos del diccionario médico, nombres de fármacos y párrafos de informes hospitalarios.
- Decodificación greedy y beam search (beam 5 con MAES) documentadas en los benchmarks.
- Phrase boosting para sesgar la decodificación hacia vocabulario médico concreto.
- Procesamiento de audio largo: se documenta una pasada única de 10 minutos sobre VoxPopuli en francés.
- Inferencia en navegador y en CPU mediante ONNX, sin envío de audio a servidores.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio generativo ni modo thinking; es un modelo exclusivamente ASR.

## Casos de uso

- Dictado clínico en consulta: el modelo transcribe dictados médicos en francés con una CER normalizada del 2,3 % (beam 5) en el test de voz real del autor, adecuado para generar borradores de informes que el facultativo revisa después.
- Transcripción de informes hospitalarios: los 2.498 clips de PARHAF en el conjunto de evaluación reflejan el escenario de párrafos de informes; el ajuste fino reduce errores en terminología frente al modelo base.
- Prescripciones y nombres de fármacos: con phrase boosting y las reglas de corrección incluidas, la CER baja al 1,9 % en el test de voz real, lo que reduce el riesgo de confundir nombres de medicamentos.
- Aplicaciones de dictado en navegador con privacidad: al ejecutarse vía ONNX en el cliente (Parakeet Web), el audio no sale del dispositivo, lo que encaja con requisitos de confidencialidad de datos de salud.
- Evaluación y entrenamiento de ASR médico: el dataset UltiMed-ASR-FR-v1 y este modelo sirven como referencia para comparar otros sistemas ASR en francés médico.
- Integración en pipelines de documentación clínica: mediante `onnx-asr` se puede incorporar la transcripción en flujos de generación de informes, con las reglas regex como postproceso barato.
- Sustitución directa entre versiones: al compartir arquitectura, tokenizer (`vocab.txt`), `config.json` y estructura de ficheros con la v2, se puede cambiar de modelo cambiando solo el identificador, lo que facilita despliegues y pruebas A/B.

## Benchmarks y rendimiento

Datos de la model card sobre conjuntos de evaluación en francés médico no vistos en entrenamiento:

| Conjunto | Clips | Descripción |
|---|---|---|
| dictionary | 5.285 | split de test de UltiMed-ASR-FR-v1, términos del diccionario médico en frases de dictado |
| parhaf | 2.498 | split de test, párrafos de informes hospitalarios PARHAF |
| drugs | 2.059 | clips de fármacos (descripción truncada en la información disponible) |

Test de estrés con voz real (grabaciones de teléfono del autor, 10 dictados médicos densos, 15 grabaciones, 5 textos leídos dos veces), CER normalizada con beam 5:

| Modelo / configuración | CER normalizada |
|---|---|
| Modelo base (parakeet-ultra) | 4,9 % |
| Este fine-tune UltiMed v1 | 2,3 % |
| Este fine-tune + phrase boosting + reglas de corrección | 1,9 % |

La model card incluye además secciones de benchmarks para decodificación greedy, beam 5 (MAES), retención multilingüe en FLEURS y audio largo (VoxPopuli en francés), pero los valores numéricos de esas secciones no están disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 0,6B parámetros, la inferencia en fp32 ronda los 2,4 GB de pesos más overhead, y las precisiones cuantizadas reducen esa cifra.
- GPU recomendadas: no se especifican en la información disponible; el modelo está orientado a CPU y navegador, por lo que no requiere GPU dedicada.
- Cabe en GPU de consumo: sí, por tamaño; cualquier GPU con unos pocos GB de VRAM puede ejecutarlo, aunque el objetivo declarado es CPU y navegador.
- Opciones de despliegue: `onnx-asr`, ONNX Runtime, la app Parakeet Web (`parakeet_web`), y despliegue en navegador vía ONNX.
- Latencia y throughput: no disponibles en la información proporcionada; se documenta una pasada única de 10 minutos de audio en VoxPopuli.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (UltiMed v1 ONNX) | ~0,6B | pasada de 10 min documentada | fr | CC-BY-4.0 | Fine-tune médico, CER 2,3 % en test de voz real |
| `moondream/parakeet-ultra` (base) | ~0,6B | no disponible | multilingüe (base de parakeet v3) | no disponible en la información | Sin especialización médica; CER 4,9 % en el mismo test |
| `nvidia/parakeet-tdt-0.6b-v3` | ~0,6B | no disponible | multilingüe | no disponible en la información | Modelo original de NVIDIA del que deriva la cadena |
| UltiMed v2 (mismo autor) | ~0,6B | misma arquitectura | fr | CC-BY-4.0 | Experimental; el autor reporta peor rendimiento en dictado humano real que esta v1 |

## Limitaciones y advertencias

- Solo soporta francés; no se documentan otros idiomas en este fine-tune.
- Es un modelo ASR: no genera texto libre, no razona, no hace tool calling ni soporta agentes.
- Riesgo de errores en nombres de fármacos y términos médicos fuera del vocabulario cubierto; por eso se recomienda aplicar las reglas regex y el phrase boosting.
- La model card advierte de que la v2 es experimental y peor en dictado humano real; debe usarse esta v1 con las correcciones regex de la v2.
- Sesgos y cobertura: el entrenamiento se basa en el dataset UltiMed-ASR-FR-v1; no se detallan en la información disponible la distribución de acentos, edades o géneros, ni los sesgos conocidos.
- El proyecto es autofinanciado y se entrena en una única GPU de consumo, lo que limita la frecuencia de mejoras.
- Licencia CC-BY-4.0: permite uso comercial con atribución; conviene revisar las condiciones de los modelos base de la cadena (moondream y NVIDIA) antes de un despliegue en producción.
- El repositorio ocupa 36,9 GB por incluir varias precisiones del encoder; hay que seleccionar solo la carpeta de la precisión necesaria.
- No se han publicado en la información disponible resultados completos de MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-UltiMed-onnx
- Modelo base: https://huggingface.co/moondream/parakeet-ultra
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Reconstrucción NeMo en ONNX: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx
- Dataset UltiMed-ASR-FR-v1: https://huggingface.co/datasets/Olicorne/UltiMed-ASR-FR-v1
- Dataset UltiMed-ASR-FR-v2: https://huggingface.co/datasets/Olicorne/UltiMed-ASR-FR-v2
- Modelo v2: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-v2-onnx
- Correcciones regex v2: https://github.com/UltiMed-Org/UltiMed-ASR-FR-v2-regex-fixes
- Organización UltiMed: https://github.com/UltiMed-Org
- App Parakeet Web: https://parakeetweb.olicorne.org/
- Código de Parakeet Web: https://github.com/thiswillbeyourgithub/parakeet_web
- `onnx-asr`: https://github.com/istupakov/onnx-asr
- Sitio del autor: https://olicorne.org
