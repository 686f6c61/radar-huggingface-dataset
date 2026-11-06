# Ninad0109/laya-academic-detector

## Resumen

Laya Academic AI Detector es un modelo de clasificación de texto especializado en detectar escritura generada por IA en contextos académicos. Lo desarrolla el usuario Ninad0109 y se distribuye bajo licencia MIT. Su particularidad es que está calibrado contra las puntuaciones reales de iThenticate/Turnitin, los sistemas de verificación de originalidad más usados en universidades y editoriales científicas, lo que lo diferencia de detectores genéricos entrenados contra corpus sintéticos.

El modelo parte de ModernBERT-base, un transformer encoder de la familia BERT con atención de contexto largo, al que se le ha añadido una cabeza de clasificación orientada a texto académico. Se distribuye cuantizado en INT8 en formato ONNX, con un peso aproximado de 150 MB y una latencia declarada de unos 60 ms por párrafo en CPU, lo que lo hace viable en entornos sin GPU.

Su relevancia actual radica en la presión creciente sobre instituciones educativas y revistas para verificar la autoría de manuscritos. El autor declara una verificación contra 52 manuscritos universitarios e IEEE puntuados en vivo en iThenticate, aunque no se publican métricas de precisión, recall ni F1 en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT-base con cabeza de clasificación académica personalizada |
| Parámetros totales | no disponible (base ModernBERT-base; el autor no especifica el recuento exacto) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (mecanismo de agregación por ventana deslizante de 220 palabras) |
| Tipos de cuantización | INT8 (ONNX) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | ONNX (INT8); el repositorio no detalla otros formatos |

## Arquitectura y entrenamiento

El modelo se construye sobre ModernBERT-base, un transformer encoder con atención bidireccional y mejoras respecto a BERT clásico en eficiencia y longitud de contexto. Sobre esa base, el autor añade una cabeza de clasificación específica para texto académico. La inferencia se ejecuta en formato ONNX con cuantización INT8 y execution provider de CPU, con un footprint de aproximadamente 150 MB y una latencia declarada de unos 60 ms por párrafo.

El componente diferencial no es solo el clasificador, sino la capa de agregación: un mecanismo de ventana deslizante con histéresis sobre pasajes de 220 palabras y múltiples frases, que pretende replicar la saturación de pasajes multi-frase de Turnitin, aplicar supresión de baja densidad (umbral de ruido inferior al 20 %) y evaluar cadencia sintáctica y formulismos. El autor indica que el modelo se calibró contra puntuaciones en vivo de iThenticate/Turnitin sobre 52 manuscritos universitarios e IEEE. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo ajuste por RLHF o DPO (poco habitual en un clasificador encoder).

## Capacidades

- Clasificación binaria o puntuada de texto como generado por IA o escrito por humano, orientada a registro académico.
- Detección a nivel de pasaje mediante ventana deslizante de 220 palabras con histéresis multi-frase.
- Supresión de falsos positivos de baja densidad (ruido por debajo del 20 %).
- Evaluación de cadencia sintáctica y estructuras formularias típicas de la escritura generada.
- Ejecución en CPU sin GPU gracias a la cuantización INT8 en ONNX.
- Integración como pipeline de `text-classification` en Hugging Face.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento explícito; es un clasificador, no un modelo generativo.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Verificación previa a envío en revistas científicas: el modelo puede puntuar manuscritos en inglés antes de pasarlos por iThenticate, permitiendo a los autores detectar secciones con alta probabilidad de marcarse como generadas por IA y revisarlas.
- Triaje en oficinas de integridad académica: procesar lotes de trabajos en CPU con ~60 ms por párrafo permite priorizar qué documentos requieren revisión humana o verificación con Turnitin.
- Filtrado en plataformas de envío de trabajos: integrar el clasificador ONNX en el backend para marcar automáticamente entregas sospechosas antes de la evaluación del docente.
- Auditoría de corpus docentes: analizar materiales, apuntes o exámenes históricos para identificar secciones con firma estilística de IA.
- Investigación sobre detección de IA: servir como baseline calibrado contra Turnitin en estudios comparativos de detectores académicos.
- Control de calidad editorial en preprints: revisar manuscritos enviados a servidores de preprints en inglés antes de su publicación.
- Despliegue en entornos con recursos limitados: al ejecutarse en CPU con 150 MB, puede correr en contenedores pequeños o incluso en portátiles sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona una verificación contra 52 manuscritos universitarios e IEEE puntuados en vivo en iThenticate el 6 de noviembre de 2026, pero no se aportan métricas de precisión, recall, F1, AUC ni comparaciones numéricas con otros detectores.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está cuantizado en INT8 y diseñado para CPU.
- Huella en disco/memoria: aproximadamente 150 MB.
- GPU recomendadas: no aplica; cualquier GPU es opcional y no se documenta soporte CUDA específico.
- Cabe en cualquier equipo consumer: portátiles, contenedores pequeños y entornos serverless.
- Opciones de despliegue: ONNX Runtime (execution provider CPU), pipeline de Hugging Face `text-classification`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un encoder de clasificación).
- Latencia declarada: ~60 ms por párrafo en CPU. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Laya Academic AI Detector | Clasificador ModernBERT + ONNX INT8 | no disponible | ventana de 220 palabras | MIT | Detección de IA calibrada contra Turnitin/iThenticate |
| Detectores comerciales (Scribbr, QuillBot) | Servicios propietarios | no disponible | no disponible | propietaria | Detección general; Scribbr reporta 78 % de acierto en pruebas de 2026 |
| Detectores genéricos open source basados en RoBERTa | Clasificador encoder | ~125 M típicamente | 512 tokens | variable (MIT/Apache) | Detección de IA sin calibración específica contra Turnitin |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; textos en castellano u otros idiomas quedan fuera de su ámbito declarado.
- No se publican métricas de precisión, recall ni tasas de falsos positivos, lo que impide evaluar su fiabilidad real.
- La calibración contra iThenticate/Turnitin se basa en 52 manuscritos, una muestra pequeña y no reproducible públicamente.
- Riesgo de sesgo contra estilos académicos muy formularios o muy uniformes, que pueden confundirse con escritura generada.
- Riesgo de alucinación no aplica (es un clasificador), pero sí de clasificaciones erróneas con consecuencias graves en contextos académicos.
- Uso en producción debe acompañarse siempre de revisión humana; las decisiones disciplinarias no deberían basarse únicamente en la salida del modelo.
- La licencia MIT permite uso comercial, pero no se documentan garantías ni mantenimiento del repositorio (0 descargas, 0 likes en el momento de la consulta).
- El repositorio es muy reciente (creado el 6 de noviembre de 2026) y no hay evidencia de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ninad0109/laya-academic-detector
- Guía de detectores de IA para integridad académica (EDUCBA): https://www.educba.com/ai-detectors-for-academic-integrity/
- Comparativa de detectores de IA (Scribbr): https://www.scribbr.com/ai-tools/best-ai-detector/
