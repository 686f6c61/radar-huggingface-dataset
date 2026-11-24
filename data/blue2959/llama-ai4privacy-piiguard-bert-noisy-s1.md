# blue2959/Llama-ai4privacy-piiguard-bert-noisy-s1

## Resumen

Llama-ai4privacy-piiguard-bert-noisy-s1 es un modelo de clasificación de tokens (token classification) para detección de información personal identificable (PII) en inglés, desarrollado por el usuario blue2959 en el marco del proyecto de curso PIIGuard (CSED490E). A pesar del nombre, no es un modelo Llama: se trata de un fine-tuning del checkpoint BERT small `gravitee-io/bert-small-pii-detection` (28,5 millones de parámetros), y la referencia a Llama proviene de que los datos de entrenamiento derivan del dataset ai4privacy, generado con Llama 3.1 y 3.3, lo que arrastra la licencia comunitaria de Llama.

El modelo aborda un problema concreto de robustez: si entrenar un etiquetador de PII sobre texto con ruido (erratas, espacios eliminados, minúsculas, puntuación suprimida, formatos numéricos alterados) recupera el rendimiento que ese ruido hace perder. Esta versión (b) se entrenó con los registros limpios del split de entrenamiento de ai4privacy más una copia ruidosa de cada uno (231.066 registros en total), con semilla 1, y tiene una contraparte limpia (`Llama-ai4privacy-piiguard-bert-clean-s1`) que difiere solo en esas copias ruidosas.

Es relevante como evidencia empírica reproducible sobre aumento de datos con ruido sintético en tareas de anonimización, no como componente listo para producción: el propio autor lo marca explícitamente como modelo de investigación no auditado para datos personales reales. Mantiene las 51 etiquetas BIO del modelo base, aunque solo seis clases reciben supervisión efectiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT small (transformer encoder, token classification) |
| Parametros totales | 28.527.155 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (ventana de entrenamiento; para textos largos se recomienda ventana deslizante con stride de 64) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | llama-3.3-community-license (modelo base Apache-2.0; uso sujeto a la Llama Acceptable Use Policy) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder BERT small con cabeza de clasificación de tokens sobre el esquema BIO de 51 etiquetas heredado del modelo base `gravitee-io/bert-small-pii-detection` (revisión `f8c27a85c5`). Solo se supervisan seis clases: PERSON, EMAIL_ADDRESS, PHONE_NUMBER, LOCATION (número de edificio y calle), DATE_TIME (cualquier fecha) y CREDIT_CARD; el resto de clases del esquema base se entrenan como `O`.

Los datos proceden del split de entrenamiento en inglés de `ai4privacy/open-pii-masking-500k-ai4privacy`, con 5.000 registros reservados como dev (semilla 0). La versión (b) añade una copia ruidosa por registro, con una edición cada diez palabras y tipos de ruido mezclados (semilla 2), hasta 231.066 registros. El entrenamiento usó AdamW con learning rate 5e-5, warm-up lineal del 6 % seguido de decaimiento lineal, weight decay 0,01, batch 32, longitud de 256 tokens y bf16, durante 10.832 pasos (tres pasadas sobre el conjunto limpio). Se conserva el checkpoint del último paso; la pérdida final en dev fue 0,0126 sobre limpio y 0,0253 sobre ruidoso. El registro completo (ajustes, sumas de verificación de los ficheros de datos, pérdidas, tiempos, GPU y versiones de paquetes) está en `training.json`. No se documenta RLHF, DPO ni decodificación especulativa, por tratarse de una tarea puramente extractiva.

## Capacidades

- Detección y etiquetado de PII en inglés: nombres de persona, direcciones de correo, números de teléfono, direcciones postales (número y calle), fechas y tarjetas de crédito.
- Clasificación de tokens a nivel de span con agregación BIO, apta para enmascarado o redacción de texto.
- Robustez parcial frente a ruido tipográfico sintético (erratas, minúsculas, falta de espacios, puntuación eliminada, formatos numéricos alterados).
- Tokenizador que normaliza todo el texto a minúsculas.
- Procesamiento por ventanas deslizantes para documentos de más de 256 tokens.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es un modelo discriminativo, no generativo.
- No tiene capacidades multimodales (visión, audio) ni modo de razonamiento explícito.
- Multilingüismo: no disponible; solo inglés.

## Casos de uso

- Preprocesado de anonimización en pipelines de datos: aplicar el modelo como primer filtro sobre textos antes de almacenarlos o compartirlos, usando ventanas de 256 tokens con stride de 64 para documentos largos.
- Investigación sobre aumento de datos con ruido: comparar esta versión con su contraparte limpia (`...-clean-s1`) y con las otras semillas (0 y 2) para medir el efecto del ruido sintético en la métrica F2 y en la tasa de fuga.
- Evaluación de robustez de etiquetadores PII: usar los conjuntos de test con ruido mixto descritos por el autor para reproducir el protocolo de evaluación y contrastar arquitecturas alternativas.
- Detección de PII en formularios y textos cortos generados: el dominio de entrenamiento son frases cortas en inglés, que es exactamente el formato de campos de formulario, mensajes de soporte o registros de CRM.
- Enmascarado de correos y teléfonos en registros de logs: para las clases EMAIL_ADDRESS y PHONE_NUMBER el rendimiento in-domain es alto (F2 de 0,983 en limpio), lo que permite usarlo como capa de redacción en herramientas internas de depuración.
- Docencia y reproducción de experimentos: el repositorio incluye `training.json` con sumas de verificación y versiones de paquetes, lo que facilita replicar el entrenamiento en un curso o taller.
- Filtrado previo a la revisión humana: dado que la licencia y las limitaciones impiden uso en producción, encaja como triaje que marca candidatos para que un revisor humano confirme el enmascarado.

## Benchmarks y rendimiento

Resultados publicados por el autor para esta semilla: F2 micro con coincidencia estricta (mismo inicio, fin y etiqueta) sobre seis etiquetas, y tasa de fuga (proporción de valores PII de referencia no enmascarados por completo).

| Conjunto de test | F2, limpio | F2, ruido mixto | Fuga, limpio | Fuga, ruido mixto |
|---|---:|---:|---:|---:|
| ai4privacy (in-domain) | 0,983 | 0,961 | 1,2 % | 2,1 % |
| Nemotron-PII | 0,774 | 0,751 | 10,8 % | 12,9 % |
| Gretel | 0,528 | 0,516 | 36,7 % | 37,8 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones numéricas con las versiones limpia y otras semillas.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en fp32 (28,5 M de parámetros, unos 114 MB de pesos) y alrededor de 60 MB en bf16/fp16; el cuello de botella es el batch y la longitud de secuencia, no el modelo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en CPU sin problema para volúmenes moderados.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4060, RTX 4090, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` pipeline de token-classification, ONNX Runtime, TorchScript, o servidores de inferencia ligeros como Hugging Face TGI o un endpoint de Inferentia/CPU. No se documentan despliegues con vLLM ni llama.cpp, orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por tamaño, es esperable un throughput de miles de secuencias cortas por segundo en una GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-ai4privacy-piiguard-bert-noisy-s1 | 28,5 M | 256 tokens | Token classification (PII, 6 clases) | Llama 3.3 community | Hugging Face |
| gravitee-io/bert-small-pii-detection (base) | del orden de 28 M (no confirmado en la información) | no disponible | Token classification (PII, 51 etiquetas BIO) | Apache-2.0 | Hugging Face |
| Llama-ai4privacy-piiguard-bert-clean-s1 | 28,5 M | 256 tokens | Token classification (PII, 6 clases) | Llama 3.3 community | Hugging Face |
| Modelos generativos tipo Llama 3.3 70B para anonimización | 70 000 M | 128 000 tokens (no confirmado) | Generación y reescritura | Llama 3.3 community | Hugging Face |

La comparación de rendimiento entre estas alternativas no está disponible en la información proporcionada; el autor solo publica métricas de esta semilla frente a los tres conjuntos de test.

## Limitaciones y advertencias

- Solo investigación: el autor declara explícitamente que no es apto para producción y que no se ha auditado con datos personales reales.
- Sesgos de anotación heredados de ai4privacy: LOCATION cubre únicamente número de edificio y calle, de modo que ciudad, código postal y número de piso quedan sin enmascarar; en datasets que marcan direcciones completas (Gretel) el modelo las recorta y deja el resto expuesto.
- Formas de correo: ningún correo de ai4privacy contiene un punto antes de la `@` (0 de 13.282) y se usan pocos proveedores comunes; el modelo parte direcciones como `john.miller@example.com` en fragmentos, algo que el modelo base no hace.
- Dominio único de entrenamiento: frases cortas generadas en inglés; el rendimiento cae fuera de ese dominio (F2 de 0,528 y fuga del 36,7 % en Gretel).
- Ruido sintético generado por script a una tasa fija; los errores tipográficos reales difieren en distribución y frecuencia.
- Riesgo de fuga de PII: la tasa de fuga llega al 37,8 % en Gretel con ruido, lo que lo hace inadecuado como única capa de anonimización.
- Idioma: solo inglés; el tokenizador pasa todo a minúsculas, lo que puede afectar a la detección de nombres propios en contextos sensibles a mayúsculas.
- Contexto limitado a 256 tokens; textos más largos requieren ventanas solapadas y pueden perder entidades en los bordes.
- Licencia: uso y distribución sujetos a la Llama 3.3 Community License y a la Llama Acceptable Use Policy; el modelo base es Apache-2.0, pero el derivado no. Verificar obligaciones de atribución y restricciones de uso comercial antes de cualquier despliegue.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso externo ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blue2959/Llama-ai4privacy-piiguard-bert-noisy-s1
- Modelo base: https://huggingface.co/gravitee-io/bert-small-pii-detection
- Dataset de entrenamiento: https://huggingface.co/datasets/ai4privacy/open-pii-masking-500k-ai4privacy
- Contraparte limpia: https://huggingface.co/blue2959/Llama-ai4privacy-piiguard-bert-clean-s1
- Licencia Llama 3.3: https://huggingface.co/blue2959/Llama-ai4privacy-piiguard-bert-noisy-s1/blob/main/LICENSE-llama-3.3.txt
- Licencia Llama 3.1: https://huggingface.co/blue2959/Llama-ai4privacy-piiguard-bert-noisy-s1/blob/main/LICENSE-llama-3.1.txt
