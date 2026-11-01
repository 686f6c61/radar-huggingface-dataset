# Ahsanmandhar/heart-murmer-agentic-hive-works

## Resumen

Heart Murmer Agentic Hive es un sistema de detección de soplos cardíacos (heart murmurs) a partir de audio fonocardiográfico, empaquetado como una aplicación multi-agente con capacidades de aprendizaje federado y intercambio P2P entre nodos. Lo desarrolla Ahsan Mandhar y se distribuye a través de HuggingFace con licencia MIT para los componentes base. No es un modelo de lenguaje: es un pipeline de inferencia de audio que utiliza un clasificador AST (Audio Spectrogram Transformer) exportado a ONNX Runtime (CPU), de aproximadamente 83 MB, combinado con una sonda lineal (linear probe) para la detección de soplos.

El sistema resuelve un problema concreto de cribado cardiovascular: clasificar sonidos cardíacos en busca de soplos anómalos, con un enfoque de despliegue distribuido entre pares que intercambian mejoras del modelo mediante bundles firmados con Ed25519, verificación de integridad SHA-256 y una puerta de promoción basada en métricas (AUC) y seguridad de abstención. Incluye además un endurecimiento de seguridad relevante para entornos clínicos: limitación de tasa, guardas de recursos, cola durable, ACL de NTFS y cadena de hashes de auditoría.

Su relevancia radica en la combinación poco habitual de inferencia de audio médico con un protocolo de federación ligero sobre LAN (descubrimiento por UDP broadcast y transporte TCP), empaquetado tanto en Python (Streamlit) como en Rust con instalador de un solo clic. El repositorio ocupa 0,3 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | AST (Audio Spectrogram Transformer) exportado a ONNX + sonda lineal (linear probe) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT (componentes base); copyright © 2026 Ahsan Mandhar para la tecnología aplicada |
| Formato de pesos | ONNX (~83 MB) |

## Arquitectura y entrenamiento

El núcleo de inferencia es un Audio Spectrogram Transformer (AST) ejecutado mediante ONNX Runtime en CPU, con un tamaño aproximado de 83 MB. Sobre las representaciones del AST se aplica una sonda lineal (linear probe) que produce la decisión de sopló. El pipeline se organiza en cinco etapas multi-agente: preprocesamiento, inferencia, decisión, seguridad y visualización. La información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO (no aplicables habitualmente a clasificación de audio, pero no confirmado).

La innovación técnica principal no está en el modelo de audio sino en la capa de sistema: un mecanismo de aprendizaje federado entre nodos que intercambian bundles firmados (probe.json, manifest.json y correcciones de feedback), con verificación de hash SHA-256, firma Ed25519, y una puerta de promoción que solo acepta un bundle si la AUC del par supera la local por un umbral, si la tasa de abstención no empeora y si las guardas de recursos (RAM, disco, CPU) son aceptables. Se incluye rollback a un backup del probe anterior en caso de fallo de promoción. El descubrimiento de pares se realiza por UDP broadcast en LAN, con transporte TCP y cabecera de tamaño de 8 bytes. Existe un modo de corrección humana (human-in-the-loop) que alimenta el feedback.

## Capacidades

- Clasificación de sonidos cardíacos para detección de soplos a partir de ficheros de audio subidos por el usuario.
- Pipeline multi-agente con etapas separadas de preprocesamiento, inferencia, decisión, seguridad y visualización.
- Intercambio P2P de mejoras del modelo mediante bundles firmados con Ed25519 y verificación de integridad SHA-256.
- Aprendizaje federado ligero con puerta de promoción basada en métricas (AUC) y seguridad de abstención.
- Descubrimiento automático de pares en red local mediante UDP broadcast.
- Corrección humana (human-in-the-loop) que retroalimenta el sistema.
- Endurecimiento de seguridad: limitación de tasa, guardas de recursos, cola durable, ACL de NTFS y cadena de hashes de auditoría.
- Doble implementación: Python (Streamlit) y Rust (instalador de un solo clic).
- Interfaz web local en http://localhost:8501 tras ejecutar el script de arranque.

## Casos de uso

- Cribado inicial de soplos en entornos de atención primaria: el clínico sube una grabación fonocardiográfica y el sistema devuelve una clasificación con abstención cuando la confianza es insuficiente, lo que permite priorizar derivaciones a cardiología.
- Investigación en auscultación automatizada: el pipeline permite comparar el rendimiento de la sonda lineal local frente a la de otros nodos, facilitando estudios de variabilidad entre centros sin centralizar datos de audio.
- Despliegue federado entre hospitales de una misma red: los nodos intercambian bundles firmados por LAN, de modo que las mejoras del clasificador se propagan sin compartir los audios originales, lo que encaja con requisitos de privacidad de datos clínicos.
- Formación de personal sanitario: la interfaz Streamlit permite reproducir grabaciones y observar la decisión del modelo junto con la etapa de visualización, útil para docencia en auscultación.
- Validación de protocolos de seguridad en IA médica: la cadena de hashes de auditoría, la verificación SHA-256 y la puerta de promoción con rollback sirven como banco de pruebas para estudiar integridad y trazabilidad de modelos distribuidos.
- Prototipado rápido en estaciones de trabajo sin GPU: al ejecutarse en ONNX Runtime sobre CPU con un modelo de ~83 MB, puede desplegarse en portátiles convencionales de consulta o laboratorio.
- Auditoría de correcciones humanas: el modo human-in-the-loop registra correcciones que pueden exportarse como parte de un bundle para que otros nodos las evalúen antes de adoptarlas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; la inferencia se ejecuta en CPU mediante ONNX Runtime.
- GPU recomendadas: no se requiere GPU; el sistema está diseñado para CPU.
- Cabe en cualquier equipo de consumo con CPU moderna; el modelo pesa ~83 MB y el repositorio completo 0,3 GB.
- Opciones de despliegue: ONNX Runtime (CPU) como motor de inferencia; interfaz Streamlit en Python 3.10+; binario Rust con instalador de un solo clic.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de detección de soplos cardíacos ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no soporta generación de texto, código, matemáticas ni tool calling en el sentido habitual; su ámbito es exclusivamente la clasificación de audio cardíaco.
- No se han publicado métricas de rendimiento (AUC, sensibilidad, especificidad) en la información disponible, por lo que no puede evaluarse su calidad clínica.
- El sistema incluye abstención como mecanismo de seguridad, lo que implica que en casos dudosos no emitirá una clasificación; esto debe tenerse en cuenta en flujos clínicos.
- Al ser una herramienta de cribado, no sustituye el diagnóstico de un cardiólogo; no consta validación regulatoria ni marcado CE/FDA.
- La licencia es dual: MIT para componentes base, pero la tecnología aplicada tiene copyright de Ahsan Mandhar; debe revisarse LICENSE.md antes de uso comercial.
- El intercambio P2P está pensado para LAN mediante UDP broadcast y TCP; no se documenta soporte para redes WAN ni NAT traversal.
- El repositorio no registra descargas ni likes, lo que sugiere ausencia de validación por parte de la comunidad.
- No se especifican los idiomas soportados ni la composición del dataset de entrenamiento, lo que impide evaluar sesgos demográficos o de origen de los datos.
- La fecha de creación indicada (2026-10-29) es posterior a la fecha habitual de consulta; conviene verificar la vigencia del repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/Ahsanmandhar/heart-murmer-agentic-hive-works
- Instalador Python: https://huggingface.co/Ahsanmandhar/heart-murmer-agentic-hive-works/resolve/main/heart-murmer-agentic-hive-python-setup.exe
- Instalador Rust: https://huggingface.co/Ahsanmandhar/heart-murmer-agentic-hive-works/resolve/main/heart-murmer-agentic-hive-setup.exe
- Código fuente (ZIP): https://github.com/ahsanmandhar-ui/heart-murmer-agentic-hive-works/archive/refs/heads/main.zip
