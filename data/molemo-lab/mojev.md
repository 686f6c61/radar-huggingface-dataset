# MoLeMo-Lab/mojev

## Resumen
MoJev es un modelo de scoring de decisiones tipadas y calibradas desarrollado por MoLeMo-Lab. Se basa en Qwen3.5-0.8B y ha sido entrenado por completo, con 854.036.544 parámetros. Su función es evaluar valores candidatos en tiempo de petición a partir de estado no estructurado (texto e imágenes) y devolver distribuciones de probabilidad vinculadas a un esquema. La salida se decodifica como Choice, Noul o Score.

El modelo resuelve la necesidad de tomar decisiones estructuradas y calibradas en una sola pasada forward, sin generación autoregresiva. Es relevante para enrutamiento, triaje, selección de herramientas y clasificación de políticas, donde se requieren umbrales de confianza para ejecución, aplazamiento o escalado. Empaqueta estado, preguntas y candidatos en una única secuencia de 320 posiciones y soporta referencias a imágenes locales.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5-0.8B con cabecera de scoring y proyecciones de readout de rango 512 |
| Parámetros totales | 854.036.544 |
| Longitud de contexto | 320 posiciones (empaquetado de estado, preguntas y candidatos) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT (el checkpoint hereda la licencia del modelo base Qwen3.5-0.8B) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Pipeline | text-classification |
| Tarea | Scoring de decisiones tipadas (Choice, Noul, Score) |
| Precisión | bf16 en encoder, fp32 en readout |
| Datos de entrenamiento | 205.084 filas de 18 generadores Open-Jev |
| Épocas | 1 |
| Tasa de aprendizaje | 1e-5 |
| Peso de Brier | 1,0 |
| Tiempo de entrenamiento | 47 minutos (paralelismo de datos en 8 vías) |

## Arquitectura y entrenamiento
MoJev emplea una arquitectura Transformer basada en Qwen3.5-0.8B, donde los 854 millones de parámetros han sido entrenados. La innovación principal es el empaquetado de estado, preguntas y candidatos en una sola secuencia, con una máscara de atención en árbol que aísla las ramas de preguntas y candidatos. La readout utiliza proyecciones de contexto y candidatos de rango 512 con producto escalar escalado. El objetivo de entrenamiento combina Plackett–Luce para ranking y una pérdida de calibración Brier. Se usa bf16 en el encoder y fp32 en la readout.

El entrenamiento se realizó sobre 205.084 filas generadas por 18 generadores Open-Jev, durante 1 época, con paralelismo de datos en 8 vías, tasa de aprendizaje de 1e-5, peso de Brier 1,0 y un tiempo de pared de 47 minutos. No se menciona el uso de RLHF o DPO; el ajuste se basa en los objetivos citados.

## Capacidades
- Scoring de decisiones tipadas: devuelve distribuciones de probabilidad sobre opciones definidas por el esquema (Choice, Noul, Score).
- Calibración: incorpora una pérdida Brier, alcanzando un error de calibración esperado (ECE) del 0,79% en la evaluación declarada.
- Salida estructurada: las respuestas están vinculadas a un esquema, con nombres de candidatos proporcionados en tiempo de petición.
- Multiple-choice: evalúa hasta 12 tokens por candidato, permitiendo opciones textuales arbitrarias.
- Aprendizaje de preferencias: el objetivo Plackett–Luce permite ordenar candidatos según preferencias.
- Multimodal: acepta referencias a imágenes locales en el estado, expandidas a tokens de parche visual; cada pregunta y candidato puede atender a esos tokens.
- Múltiples decisiones sobre estado compartido: puede resolver varias preguntas tipadas en una misma pasada.
- Selección de herramientas y flujos: adecuado para enrutamiento y elección de acciones con umbrales de confianza.
- No es un modelo generativo de texto libre; su salida son logits decodificados como distribuciones.

## Casos de uso
- Enrutamiento y triaje de tickets: el modelo clasifica un ticket de soporte en categorías predefinidas (p. ej., facturación, técnico, otro) y devuelve probabilidades calibradas. Con un ECE bajo, se pueden establecer umbrales para derivar automáticamente o escalar a un humano.
- Selección de herramientas en agentes: dado un estado conversacional, el modelo puntúa qué herramienta o API invocar (p. ej., búsqueda, cálculo, base de datos) con una distribución de probabilidad, permitiendo decisiones de ejecución o aplazamiento.
- Clasificación de políticas y evidencia: evalúa si un documento o fragmento cumple una política interna, devolviendo un Score de cumplimiento y una distribución sobre niveles (cumple, no cumple, parcial). Útil para auditoría automatizada.
- Decisiones tipadas múltiples: en un mismo estado (p. ej., una reclamación), resuelve varias preguntas con esquemas distintos (categoría, urgencia, sentimiento) en una sola pasada forward, reduciendo latencia frente a múltiples llamadas.
- Aplazamiento y escalado calibrado: gracias a la calibración explícita, el modelo puede decidir cuándo su confianza es insuficiente y derivar la decisión a un operador humano, con umbrales ajustables según el coste del error.
- Moderación de contenido multimodal: a partir de texto e imágenes locales, clasifica si una publicación infringe una política, con opciones como permitido, revisar, bloqueado, y probabilidades asociadas.
- Extracción de información estructurada: dado un estado con texto e imagen, selecciona el valor correcto entre candidatos (p. ej., identificar el sujeto de una imagen entre opciones), como se muestra en la model card con P(cat) = 0,786 para una imagen de gato.

## Benchmarks y rendimiento
| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Scoring de decisiones tipadas | MoJev-Mix test (12.000 decisiones) | Accuracy | 0,9323 |
| Scoring de decisiones tipadas | MoJev-Mix test | ECE (error de calibración esperado) | 0,0079 (0,79%) |

No se han publicado resultados comparativos con otros modelos en la información proporcionada.

## Requisitos de hardware
- VRAM estimada para inferencia: el modelo tiene 854 millones de parámetros. En bf16, los pesos ocupan aproximadamente 1,7 GB. Con activaciones y overhead, se estima un consumo de VRAM inferior a 4 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 3060, RTX 4090, A100, H100. Para producción, se recomienda una GPU con soporte bf16 (Ampere o superior).
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4070, RTX 4090, e incluso en GPUs de 4-6 GB con cuantización (aunque no se especifican tipos de cuantización).
- Opciones de despliegue: mediante transformers con `trust_remote_code=True`, o a través del servidor MoJev (`mojev serve MoLeMo-Lab/mojev --port 8000`). No se mencionan otros backends como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un modelo de 0,8B y una sola pasada forward, se espera baja latencia, pero no hay cifras oficiales.

## Comparativa con modelos similares
No se han identificado modelos comparables directos en la información proporcionada. MoJev no es un modelo generativo, sino un scorer de decisiones tipadas. Como referencia, el modelo base Qwen3.5-0.8B es un LLM generativo de 0,8B con licencia propia, pero no ofrece la funcionalidad de scoring calibrado ni la salida estructurada de MoJev. Otros sistemas de clasificación (p. ej., basados en BERT) no cubren la calibración explícita ni el soporte multimodal con el mismo contrato. Por tanto, la comparativa directa no está disponible.

## Limitaciones y advertencias
- Idiomas soportados: no disponibles; no se especifica el soporte multilingüe.
- Sesgos conocidos: no se documentan sesgos específicos en la información proporcionada.
- Riesgo de alucinación: aunque no genera texto libre, puede producir distribuciones de probabilidad erróneas si el estado de entrada está fuera de la distribución de entrenamiento.
- Limitación de contexto: 320 posiciones empaquetadas; documentos o estados más largos deben truncarse o resumirse, lo que puede degradar el rendimiento.
- Candidatos limitados: cada candidato puede tener hasta 12 tokens; opciones más largas no están soportadas directamente.
- Restricciones de licencia: el código es MIT, pero el checkpoint hereda la licencia de Qwen3.5-0.8B. Es necesario revisar los términos de dicha licencia para uso comercial.
- Requiere `trust_remote_code=True`: implica ejecutar código personalizado del repositorio, con los riesgos de seguridad asociados.
- Tipos de cuantización no especificados: puede limitar el despliegue en hardware con restricciones de memoria si no se dispone de herramientas de cuantización compatibles.
- Multimodal restringido: solo acepta referencias a rutas absolutas de imágenes locales, no URLs ni flujos de bytes.
- Calibración: el ECE del 0,79% es bajo en el conjunto de evaluación, pero puede degradarse en dominios fuera de distribución; se recomienda validar en el dominio objetivo.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/MoLeMo-Lab/mojev
- Repositorio de código: https://github.com/MoLeMo-Lab/mojev
- Dataset: https://huggingface.co/datasets/MoLeMo-Lab/mojev-mix
- Resultados: https://github.com/MoLeMo-Lab/mojev#results
- Contacto: contact@molemo.org
