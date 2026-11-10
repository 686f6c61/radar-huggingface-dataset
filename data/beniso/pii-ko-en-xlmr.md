# beniso/pii-ko-en-xlmr

## Resumen

`beniso/pii-ko-en-xlmr` es un modelo de clasificación de tokens (token classification) especializado en la detección y redacción de información personal identificable (PII) en textos en inglés, coreano y código mixto (code-mixed). Lo desarrolla el usuario `beniso` y se distribuye bajo licencia MIT. El modelo se apoya en XLM-RoBERTa como encoder base y añade una cabeza de clasificación a nivel de carácter que devuelve spans exactos de caracteres para las entidades detectadas, en lugar de depender de la tokenización por subpalabras.

Las entidades que reconoce son `PER` (persona), `RRN` (número de registro de residente coreano), `PHONE`, `EMAIL`, `ADDRESS`, `CARD` (tarjeta de crédito) y `ORG` (organización). Está pensado para ejecutarse en una sola GPU de consumo o incluso en CPU, y no realiza llamadas de red en inferencia, lo que facilita su despliegue en entornos con requisitos de privacidad estrictos. Según la model card, se entrenó exclusivamente con datos sintéticos.

Su relevancia actual radica en la combinación de dos factores poco frecuentes en este nicho: cobertura de coreano junto con inglés en un mismo modelo, y salida a nivel de carácter que permite redactar el texto original con precisión de offsets. El repositorio ocupa 0,6 GB y no registra descargas ni likes en el momento de la consulta, lo que sugiere un modelo reciente y de baja adopción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (encoder transformer) con cabeza de clasificación a nivel de carácter |
| Parametros totales | no disponible (repo de 0,6 GB; compatible con la variante base de XLM-R) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ko (incluye texto code-mixed) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0,6 GB, presumiblemente safetensors o PyTorch bin) |

## Arquitectura y entrenamiento

El modelo parte de XLM-RoBERTa como encoder multilingüe y sustituye la cabeza estándar de clasificación por token por una cabeza que opera a nivel de carácter, de modo que la salida son spans de caracteres exactos sobre el texto de entrada. Esta decisión de diseño evita el desalineamiento habitual entre la tokenización por subpalabras y los límites reales de las entidades, algo crítico en redacción de PII donde un offset incorrecto puede dejar expuesto un fragmento sensible.

Según la model card, el entrenamiento se realizó **únicamente con datos sintéticos**, documentados en el `DATA_CARD` del repositorio de código asociado. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de ajuste fino adicionales más allá del entrenamiento supervisado de token classification. Las métricas se publican en un `REPORT.md` generado automáticamente por el script `run_all.sh` del repositorio de código, y el autor indica explícitamente que no incluye cifras escritas a mano en la model card.

## Capacidades

- Detección de entidades PII de siete tipos: `PER`, `RRN`, `PHONE`, `EMAIL`, `ADDRESS`, `CARD` y `ORG`.
- Salida de spans exactos a nivel de carácter, apta para redacción directa sobre el texto original.
- Procesamiento de inglés, coreano y texto code-mixed (mezcla de ambos idiomas en un mismo documento).
- Ejecución en una sola GPU de consumo o en CPU, sin llamadas de red durante la inferencia.
- Interfaz de línea de comandos incluida en el paquete `pii` (`python -m pii.cli`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modalities adicionales (visión, audio); el modelo es exclusivamente un extractor de entidades.

## Casos de uso

- **Redacción de logs de aplicaciones**: el modelo puede procesar líneas de log que contengan correos, teléfonos o nombres antes de almacenarlas o enviarlas a un sistema de observabilidad, reduciendo la exposición de datos personales en herramientas de terceros.
- **Anonimización previa a entrenamiento de modelos**: en pipelines de preparación de datos para fine-tuning, se puede aplicar el modelo sobre corpus en inglés y coreano para enmascarar PII antes de que el dataset entre en el entrenamiento.
- **Cumplimiento en atención al cliente**: en transcripciones de chats o correos de soporte en coreano e inglés, el modelo permite redactar números de teléfono, correos y direcciones antes de que el contenido se almacene en un CRM o se revise por analistas.
- **Preprocesado de documentos para revisión legal**: detección de nombres y organizaciones en contratos o expedientes bilingües, generando una versión redactada para revisión por personal no autorizado a ver los datos originales.
- **Filtrado en foros y comunidades**: moderación automatizada de contenido generado por usuarios donde se comparten datos personales de terceros (doxxing), con soporte para texto mezclado coreano-inglés habitual en comunidades online.
- **Sanitización en entornos sin conectividad**: al no requerir llamadas de red y poder ejecutarse en CPU, encaja en despliegues on-premise o air-gapped donde no se permite enviar datos a APIs externas.
- **Generación de datasets sintéticos anonimizados**: uso como paso de verificación para comprobar que los datos sintéticos generados no contienen PII residual antes de publicarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a un `REPORT.md` del repositorio de código generado por `run_all.sh`, pero no se incluyen cifras (precisión, recall, F1 por entidad) en la información proporcionada, y el autor advierte explícitamente que no escribe números a mano en la model card.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita; el repo ocupa 0,6 GB y la model card indica que se ejecuta en una sola GPU de consumo o en CPU.
- **GPU recomendadas**: cualquier GPU de consumo moderna es suficiente según el autor; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- **CPU**: soportada explícitamente como opción de despliegue.
- **Opciones de despliegue**: el autor proporciona un CLI propio (`python -m pii.cli`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un encoder de clasificación).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de detección de PII ni con alternativas multilingües de token classification, y no se dispone de datos de rendimiento para establecer una comparación rigurosa.

## Limitaciones y advertencias

- **Brecha sintético-real**: el modelo se entrenó solo con datos sintéticos, por lo que puede degradarse ante distribuciones reales de texto no representadas en el corpus de entrenamiento.
- **Riesgo en fronteras de anotación**: el autor señala riesgo de convención de anotación en los límites de `ADDRESS` y `ORG`, lo que puede provocar spans incompletos o sobreextendidos.
- **Conjunto de prueba reducido**: las evaluaciones se apoyan en un conjunto de probes escrito a mano de tamaño pequeño, lo que limita la fiabilidad de las métricas reportadas.
- **No apto como única salvaguarda**: la model card advierte explícitamente de que no debe usarse como único mecanismo de redacción en contextos críticos de cumplimiento normativo.
- **Cobertura lingüística limitada**: solo inglés y coreano; no hay evidencia de rendimiento en otros idiomas ni en variedades dialectales.
- **Licencia**: MIT, permisiva para uso comercial, pero sin garantías implícitas; conviene revisar el `DATA_CARD` y el `REPORT.md` del repositorio de código antes de desplegar en producción.
- **Adopción mínima**: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/beniso/pii-ko-en-xlmr
- Repositorio de código y `DATA_CARD` / `REPORT.md`: no disponible en la información proporcionada (la model card los menciona sin enlace explícito).
