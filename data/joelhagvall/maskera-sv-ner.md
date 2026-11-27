# joelhagvall/maskera-sv-ner

## Resumen

maskera-sv-ner es un modelo de clasificación de tokens (NER) especializado en la detección de información personal identificable (PII) en texto libre en sueco. Lo desarrolla joelhagvall como componente del proyecto maskera, una herramienta de redacción automática orientada al cumplimiento del RGPD. El modelo identifica cuatro categorías de entidades: nombres de persona (PER), lugares (LOC), organizaciones (ORG) y direcciones postales (ADR), y se distribuye en formato ONNX para su ejecución en el navegador mediante Transformers.js (WebGPU/WASM) o en Node.js.

Se trata de un derivado destilado del modelo KB-BERT (KBLab/bert-base-swedish-cased), reducido a 6 capas y con un tamaño de artefacto de aproximadamente 43 MB en su cuantización q4. Esta compacidad permite ejecutar la detección de PII íntegramente en el dispositivo del usuario, sin enviar texto a servidores externos, lo que resulta relevante para flujos de trabajo con requisitos estrictos de privacidad y soberanía del dato.

La versión publicada es la v21 (27 de noviembre de 2026), que según el autor mejora la robustez ante texto en minúsculas y mayúsculas y reduce los falsos positivos en frases sin entidades respecto a la v20. El modelo se complementa con reglas deterministas para identificadores estructurados suecos (personnummer, IBAN, teléfono, correo electrónico), de modo que las reglas tienen prioridad en caso de solapamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT, destilado a 6 capas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con párrafos de hasta 256 tokens) |
| Tipos de cuantizacion | q4 (~43 MB), q8/int8 (~59 MB), fp32 (~233 MB) |
| Idiomas soportados | sueco (sv) |
| Licencia | MIT |
| Formato de pesos | ONNX (para Transformers.js) |

## Arquitectura y entrenamiento

El modelo es un encoder BERT derivado de KBLab/bert-base-swedish-cased (KB-BERT, licencia CC0), destilado de 12 a 6 capas. Realiza clasificación de tokens con esquema BIO sobre cuatro etiquetas de entidad (PER, LOC, ORG, ADR) más la etiqueta O. Está diseñado para ser robusto tanto ante texto en minúsculas como ante texto en mayúsculas sostenidas.

El ajuste fino de la tarea y la destilación de la v21 se realizaron sobre 121.200 filas de entrenamiento generadas y 7.980 filas de validación disjuntas, producidas por un generador propio (training/generate_data.mjs). El conjunto incluye párrafos multi-frase de hasta 256 tokens y contrastes específicos de precisión y homógrafos en sueco, destilados desde un ensemble profesor de KB-BERT con 3 semillas. Según el autor, no se emplean datos de clientes, registros, texto raspado ni corpus NER públicos, y se rechaza toda fila que contenga IBAN, número personal o de organización, teléfono, correo, URL, IP, identificador de pago, número de cuenta largo o código postal.

## Capacidades

- Detección de entidades nombradas en texto libre sueco en cuatro categorías: PER (nombre de persona), LOC (lugar), ORG (organización) y ADR (dirección postal).
- Clasificación de tokens con esquema BIO, con robustez ante minúsculas y mayúsculas sostenidas.
- Ejecución en el dispositivo mediante Transformers.js en navegador (WebGPU/WASM) o en Node.js, sin envío de texto a servidores.
- Integración con la librería maskera para redacción con marcadores de posición (`[NAMN_1]`, `[PLATS_1]`, `[ORGANISATION_1]`, `[ADRESS_1]`) y función de restauración del texto original.
- Perfil clínico (`profile: "clinical"`) que conserva medidas, dosis de medicación y términos asistenciales habituales manteniendo activas las reglas de identificadores.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Redacción de PII en formularios y textos libres en aplicaciones web: el modelo se ejecuta en el navegador vía Transformers.js con cuantización q4 (~43 MB), de modo que el texto del usuario nunca abandona el dispositivo y se facilita el cumplimiento del RGPD.
- Preprocesado de documentación clínica: con el perfil `clinical` se enmascaran nombres, lugares y organizaciones de historiales o notas, conservando medidas y dosis necesarias para el análisis posterior.
- Anonimización de currículums y perfiles profesionales: el autor reporta un F1 de span del 98,1% sobre un conjunto sintético estilo LinkedIn (32 documentos, 53 entidades), lo que lo hace adecuado para pipelines de selección de personal que deban eliminar datos identificativos antes de la revisión.
- Saneado de logs y textos de soporte antes de su almacenamiento o envío a terceros: combinado con las reglas deterministas de maskera para personnummer, IBAN, teléfonos y correos, cubre tanto identificadores estructurados como nombres en texto libre.
- Generación de conjuntos de datos seudonimizados para investigación: la función de restauración permite recuperar el texto original a partir de los marcadores, lo que facilita flujos reversibles de anonimización en estudios con datos personales.
- Cumplimiento normativo en procesos de publicación de documentos: detección y sustitución de nombres de personas y organizaciones en actas, informes o comunicaciones antes de su difusión pública.

## Benchmarks y rendimiento

Evaluación independiente en sueco (23.980 textos, sin filas del entrenamiento de Maskera), medida el 27 de noviembre de 2026 sobre el artefacto q4:

| Categoría | Resultado |
|---|---:|
| Nombres | 94,6% (11.885/12.570) |
| Nombres en minúsculas | 91,1% (4.401/4.829) |
| Lugares | 97,3% (5.592/5.749) |
| Direcciones y códigos postales | 95,3% (5.225/5.482) |
| Frases sin entidad con falso positivo (SUC + SIC2) | 12,3% (1.326/10.800; 21,4% en v20) |

Puertas de release sobre conjuntos sintéticos en sueco:

| Conjunto | Span F1 | Fugas | Notas |
|---|---:|---:|---|
| Curado (149 docs / 205 entidades) | 98,8% | 0/205 | Span exacto, incluye minúsculas y mayúsculas; F1 etiquetado 98,8% |
| Sintético ADR revisado (41 docs / 57 entidades) | 100,0% | 0/57 | Precisión ADDRESS 35/35; F1 etiquetado 98,2% |
| Estilo LinkedIn (32 docs / 53 entidades) | 98,1% | 0/53 | Span exacto |
| Apellidos raros descomponibles (294 entidades) | no disponible | 14/294 | Recall de enmascarado 95,24% (280/294) |

Comparativa v21 q4 frente a KBLab lowermix fp32 (121 textos sintéticos, 211 entidades PER/LOC/ORG):

| Casing | Modelo | Enmascarado | F1 tipado |
|---|---|---:|---:|
| original | maskera-sv-ner v21 q4 | 99,5% (210/211) | 89,6% |
| original | KBLab lowermix fp32 | 97,2% (205/211) | 89,4% |
| minúsculas | maskera-sv-ner v21 q4 | 100,0% (211/211) | 88,4% |
| minúsculas | KBLab lowermix fp32 | 88,6% (187/211) | 83,2% |

El autor advierte que los conjuntos de las puertas de release y de la comparativa con KBLab son sintéticos y están acoplados al autor, por lo que deben interpretarse como evidencia direccional de regresión y no como una clasificación universal independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones; el artefacto q4 ocupa ~43 MB y el fp32 ~233 MB.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. En navegador puede acelerarse con WebGPU y en Node.js con WASM.
- Cabe en cualquier GPU de consumo e incluso en dispositivos móviles y entornos sin GPU.
- Opciones de despliegue: Transformers.js (navegador o Node.js), librería maskera, y cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tamaño | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| maskera-sv-ner v21 q4 | ~43 MB (ONNX q4) | no disponible | sv | MIT | NER de PII, on-device |
| KBLab/bert-base-swedish-lowermix-reallysimple-ner fp32 | ~496 MB | no disponible | sv | no disponible | NER general sueco |
| KB-BERT (KBLab/bert-base-swedish-cased) | no disponible | no disponible | sv | CC0 | Modelo base, sin ajuste NER |

Frente a KBLab lowermix, el modelo de maskera obtiene un enmascarado del 99,5% frente al 97,2% en texto con casing original y del 100,0% frente al 88,6% en minúsculas, con un F1 tipado comparable (89,6% frente a 89,4%) y un tamaño aproximadamente diez veces menor en q4. No se dispone de datos de benchmarks frente a otros modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta sueco; no está entrenado ni evaluado para otros idiomas.
- Tasa de falsos positivos del 12,3% en frases sin entidades (SUC + SIC2), lo que puede provocar enmascarados innecesarios en texto genérico.
- Recall del 95,24% en apellidos raros descomponibles: 14 de 294 entidades no se enmascaran, con el consiguiente riesgo de fuga de datos personales.
- Los conjuntos de evaluación de las puertas de release y de la comparativa con KBLab son sintéticos y acoplados al autor; no constituyen una validación independiente universal.
- El modelo cubre únicamente PII en texto libre; los identificadores estructurados (personnummer, IBAN, teléfono, correo) dependen de las reglas deterministas de maskera, no del modelo.
- Riesgo de alucinación de entidades no documentado en la información disponible; los sesgos conocidos no se detallan en la model card.
- Licencia MIT, que permite uso comercial, pero sin garantías explícitas de idoneidad para producción en dominios no evaluados.
- El rendimiento puede degradarse en dominios muy alejados de los datos sintéticos de entrenamiento (por ejemplo, jerga técnica o texto histórico).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joelhagvall/maskera-sv-ner
- Repositorio maskera: https://github.com/joelhagvall/maskera
- Benchmarks canónicos: https://github.com/joelhagvall/maskera/blob/main/docs/BENCHMARKS.md
- Demo: https://maskera.dev
- Modelo base KB-BERT: https://huggingface.co/KBLab/bert-base-swedish-cased
- Modelo comparable KBLab lowermix: https://huggingface.co/KBLab/bert-base-swedish-lowermix-reallysimple-ner
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
