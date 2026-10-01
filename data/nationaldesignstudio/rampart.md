# nationaldesignstudio/rampart

## Resumen

Rampart es un modelo de clasificación de tokens (token-classification) publicado por National Design Studio cuyo objetivo es detectar información personal identificable (PII) en texto directamente en el dispositivo del usuario, antes de que los datos salgan del navegador. Se distribuye como un artefacto ONNX de 14,7 MB cuantizado a 4 bits y está pensado para ejecutarse en el cliente mediante `transformers.js` sobre ONNX Runtime Web (WASM/WebGPU).

Técnicamente es un ajuste fino del modelo `nreimers/MiniLM-L6-H384-uncased`, un transformer encoder de tipo BERT con 6 capas y aproximadamente 18,5 millones de parámetros tras recortar el vocabulario a 19.730 WordPieces. Sobre esa base se ha entrenado una cabeza de clasificación BIO con 35 etiquetas que cubren 17 tipos de entidad. La longitud máxima de secuencia es de 512 tokens y soporta siete idiomas de escritura latina: inglés, español, francés, alemán, italiano, portugués y neerlandés.

El modelo forma parte de un sistema de redacción en dos capas: la capa determinista (que valida estructuras como SSN o tarjetas de pago mediante checksums y reglas) y esta capa neuronal, que se encarga de identificadores sin checksum (teléfonos, pasaportes, nombres, etc.). Es relevante porque permite desplegar redacción de PII completamente en el navegador, con un consumo de recursos mínimo y sin enviar texto sin depurar a servidores remotos. El dataset de entrenamiento es `ai4privacy/pii-masking-openpii-1.5m`, bajo licencia CC BY 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT encoder (MiniLM-L6-H384-uncased) con cabeza BIO de 35 etiquetas (17 tipos de entidad) |
| Parametros totales | ≈18,5 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | 4-bit MatMul + INT8 embedding (`onnx/model_q4.onnx`) |
| Idiomas soportados | ingles, espanol, frances, aleman, italiano, portugues, neerlandes |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX |
| Tamano del artefacto | 14,7 MB |
| Vocabulario | 19.730 WordPieces (recortado desde 30.522) |
| Runtime | ONNX Runtime Web (WASM/WebGPU) via transformers.js |
| Pipeline | token-classification |

## Arquitectura y entrenamiento

El modelo parte de `nreimers/MiniLM-L6-H384-uncased`, un transformer encoder de estilo BERT con 6 capas, 384 dimensiones ocultas y 12 cabezas de atención, comprimido mediante destilación. Sobre este backbone se ha entrenado una cabeza de clasificación de tokens con esquema BIO de 35 etiquetas que representan 17 tipos de entidad distintos (nombres, apellidos, SSN, teléfonos, direcciones, etc.). El vocabulario se ha recortado de 30.522 a 19.730 WordPieces, conservando todos los tokens especiales y de un solo carácter más los multicharacter frecuentes, lo que reduce el tamaño del embedding.

El entrenamiento se realizó sobre el dataset `ai4privacy/pii-masking-openpii-1.5m` (licencia CC BY 4.0). La model card menciona la existencia de variantes exploradas durante la selección del modelo (una base ELECTRA-small, una variante sin prefilter y mezclas de datos más ligeras) que se documentan en un whitepaper pero que no se han publicado. No se detalla en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron fases de RLHF o DPO (poco probable en un modelo encoder de clasificación). Las métricas declaradas para evaluar el modelo son recall de términos privados, retención de términos públicos, span-F1 y ECE (calibración), aunque no se aportan valores numéricos.

## Capacidades

- Detección y etiquetado de PII en texto mediante clasificación de tokens con esquema BIO.
- Redacción en el cliente: sustituye valores identificativos por marcadores estables como `[GIVEN_NAME_1]` o `[SSN_1]`.
- Mantenimiento de marcadores coherentes a lo largo de una conversación multi-turno, con rehidratación en el cliente.
- Detección de identificadores sin checksum: teléfonos, números de ruta, documentos de identidad gubernamentales, pasaportes y números de licencia.
- Soporte multilingüe en siete idiomas de escritura latina (en, es, fr, de, it, pt, nl).
- Ejecución íntegra en el navegador mediante WASM o WebGPU, sin dependencia de servidor.
- Integración como capa de un sistema de defensa en profundidad junto a un reconocedor determinista que valida checksums (SSN, tarjetas de pago con algoritmo de Luhn).
- Exposición mediante el paquete npm `@nationaldesignstudio/rampart`, con una API `createGuard()` que devuelve un objeto `ChatGuard`.

## Casos de uso

- Redacción previa al envío a LLM alojados: se intercepta el texto del usuario, se detectan y sustituyen los datos personales por marcadores estables y solo después se transmite al proveedor del modelo, evitando fugas de información sensible.
- Asistentes conversacionales en el navegador: con 512 tokens de contexto por pasada, el modelo gestiona turnos de chat y mantiene la coherencia de los marcadores (por ejemplo, `[SURNAME_1]` siempre apunta a la misma persona), rehidratando en cliente cuando el modelo responde.
- Cumplimiento de normativa de privacidad (RGPD y similares): la redacción on-device permite demostrar que los datos personales no abandonan el dispositivo antes de cumplir con minimización de datos en sistemas de tratamiento.
- Analítica y telemetría: limpiar automáticamente trazas, logs y reportes de fallos para evitar la recogida accidental de PII en herramientas de observabilidad.
- Formularios de admisión y onboarding: depurar datos introducidos por el usuario en flujos de registro antes de almacenarlos o procesarlos en servidores.
- Validación de políticas de redacción en dominios regulados: probar y ajustar reglas de anonimización antes de desplegar sistemas de chat en entornos con requisitos legales estrictos.
- Procesamiento de texto en aplicaciones web estáticas: al ejecutarse en WASM/WebGPU, puede integrarse en aplicaciones sin backend propio, ideal para herramientas de productividad o extensiones de navegador.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card declara las métricas que se utilizan para evaluar el modelo (private-term-recall, public-term-retention, span-F1 y ECE), así como la mención de que se publican cifras sobre entradas adversarias, pero no se incluyen los valores concretos en el material proporcionado. No se deben asumir cifras no facilitadas.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente despreciable; el artefacto cuantizado pesa 14,7 MB y el modelo ocupa del orden de decenas de MB en memoria durante la ejecución.
- GPU recomendadas: ninguna dedicada es necesaria. La ejecución principal prevista es en CPU (WASM) o en WebGPU (GPU integrada o dedicada del dispositivo del usuario).
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo e incluso en GPU integradas, ya que el modelo es un encoder de 18,5M de parámetros.
- Opciones de despliegue: `transformers.js` con ONNX Runtime Web (WASM/WebGPU); paquete npm `@nationaldesignstudio/rampart` con API `createGuard()`.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos numéricos de rendimiento en la información proporcionada, por lo que la comparación cuantitativa no es posible. Cualitativamente, este modelo se puede situar frente a otras alternativas de detección de PII y NER ligero, pero los datos comparativos no están disponibles.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| nationaldesignstudio/rampart | ≈18,5M | 512 tokens | 7 (latinos) | CC BY 4.0 | ONNX (4-bit/INT8) |
| nreimers/MiniLM-L6-H384-uncased (base) | ≈22,7M (vocab completo) | 512 tokens | principalmente ingles | Apache 2.0 (segun base) | safetensors / otros |
| Alternativas de NER/PII comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

Existen otros modelos de detección de PII y de reconocimiento de entidades (por ejemplo, variantes de BERT-base-NER), pero no se dispone de sus cifras de rendimiento ni de especificaciones verificadas en la información proporcionada, por lo que se indica "no disponible".

## Limitaciones y advertencias

- No es un sistema autónomo de detección de documentos oficiales: forma parte de una arquitectura de defensa en profundidad y requiere la capa determinista que valida checksums (SSN y tarjetas de pago se detectan mejor en esa capa).
- No detecta identificadores inferenciales: combinaciones como "enfermedad rara + código postal de 5 dígitos" pueden reidentificar a una persona aunque ninguno de los tokens esté en el conjunto de redacción.
- Robustez adversaria limitada: el sistema se posiciona como reducción de daño para usuarios que introducen su propia información de buena fe, no como frontera de seguridad frente a adversarios motivados.
- Scripts no latinos: en coreano, chino han, japonés, árabe, cirílico y devanagari el recall agregado de nombres es de aproximadamente el 14%. No debe desplegarse para poblaciones que escriben habitualmente nombres en estos alfabetos sin controles compensatorios.
- Contexto limitado a 512 tokens: textos más largos deben dividirse, lo que puede fragmentar entidades a caballo entre segmentos.
- Riesgo de alucinación en la etiquetación: como cualquier clasificador, puede generar falsos positivos y falsos negativos; la model card no aporta cifras numéricas de precisión o recall en el material disponible.
- Sesgos potenciales derivados del dataset de entrenamiento (`ai4privacy/pii-masking-openpii-1.5m`), que no se detalla en la información proporcionada.
- Licencia CC BY 4.0: permite uso comercial siempre que se atribuya adecuadamente la autoría; es necesario revisar las condiciones de atribución en un despliegue en producción.
- Fecha de publicación y actualización (2026-06-28 y 2026-06-30) según los metadatos del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nationaldesignstudio/rampart
- Modelo base: https://huggingface.co/nreimers/MiniLM-L6-H384-uncased
- Dataset de entrenamiento: https://huggingface.co/datasets/ai4privacy/pii-masking-openpii-1.5m
- Paquete npm: https://www.npmjs.com/package/@nationaldesignstudio/rampart
- Whitepaper del proyecto: mencionado en la model card, sin enlace disponible en la información proporcionada.
- Repositorio de código: no disponible en la información proporcionada.
