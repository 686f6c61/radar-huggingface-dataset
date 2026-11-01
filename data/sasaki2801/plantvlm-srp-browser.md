# Sasaki2801/plantvlm-srp-browser

## Resumen

PlantVLM (browser build) es un modelo vision-lenguaje de dominio específico desarrollado por Sasaki2801 para la clasificación de deficiencias nutricionales en hojas de café. Combina un codificador visual SigLIP-base-patch16-224 con un proyector MLP y un modelo de lenguaje Qwen2-0.5B-Instruct (con LoRA fusionado), todo ello ajustado sobre el conjunto de datos CoLeaf, que cubre 9 clases de deficiencias nutricionales. El resultado se ha exportado a ONNX y comprimido en formato q4 para su ejecución en navegador mediante ONNX Runtime Web.

La relevancia del modelo radica en su enfoque de despliegue: no se distribuye como un checkpoint de PyTorch convencional, sino como un artefacto optimizado para inferencia local en el cliente, sin necesidad de GPU ni de backend. Esto lo hace adecuado para aplicaciones agrícolas de campo donde la conectividad es limitada y se requiere privacidad de los datos de imagen.

El modelo es de tamaño reducido (repo de 0,3 GB) y está pensado como una demostración funcional más que como un modelo de propósito general. Su evaluación sobre un conjunto de test de 97 hojas reporta una precisión del 80,4% y un macro-F1 de 0,742, con una coincidencia del 90% respecto al modelo completo en PyTorch.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model: SigLIP-base-patch16-224 (vision encoder) + MLP projector + Qwen2-0.5B-Instruct (LoRA merged) |
| Parametros totales | no disponible (componentes: SigLIP-base y Qwen2-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4 (formato comprimido para ONNX Runtime Web) |
| Idiomas soportados | no disponible |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (comprimido q4) |

## Arquitectura y entrenamiento

La arquitectura sigue el patrón típico de los modelos vision-lenguaje: un codificador visual SigLIP-base-patch16-224 procesa la imagen de entrada y genera representaciones que un proyector MLP transforma al espacio de embeddings del modelo de lenguaje, en este caso Qwen2-0.5B-Instruct con un adaptador LoRA ya fusionado en los pesos. El ajuste se realizó sobre el conjunto CoLeaf, centrado en deficiencias nutricionales de hojas de café con 9 clases.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset más allá de CoLeaf, ni si se emplearon técnicas de RLHF o DPO. La innovación técnica destacable es la exportación a ONNX con compresión q4 para su ejecución en navegador mediante ONNX Runtime Web, lo que permite inferencia local en el cliente sin infraestructura de servidor.

## Capacidades

- Clasificación de deficiencias nutricionales en hojas de café en 9 clases.
- Procesamiento de imágenes (visión) combinado con generación de texto mediante el modelo de lenguaje subyacente.
- Inferencia en navegador mediante ONNX Runtime Web, sin necesidad de backend.
- Ejecución local con pesos comprimidos en q4.
- No se ha documentado soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no documentadas).

## Casos de uso

- Diagnóstico agrícola en campo: un técnico fotografía una hoja de café desde el móvil y el modelo, ejecutado en el navegador, devuelve la clase de deficiencia nutricional. Es adecuado por su despliegue ONNX Runtime Web y su tamaño reducido.
- Aplicación web offline para cooperativas cafetaleras: al no requerir backend, la inferencia ocurre en el dispositivo del usuario, lo que reduce costes de infraestructura y permite su uso en zonas con conectividad limitada.
- Triaje previo en laboratorios agrónomos: el modelo puede preseleccionar muestras con posibles deficiencias antes de un análisis químico completo, gracias a su precisión del 80,4% en el conjunto de test.
- Herramienta educativa para formación agrónoma: permite a estudiantes comparar la predicción del modelo con la evaluación de un experto, usando la demo pública alojada en Hugging Face Spaces.
- Integración en sistemas de monitorización de cultivos: al ser un artefacto ONNX, puede incorporarse en pipelines de visión existentes que ya usen ONNX Runtime.
- Prototipado rápido de asistentes agrícolas: sirve como base para experimentar con modelos vision-lenguaje de dominio específico antes de invertir en modelos mayores.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precisión (test set, 97 hojas) | 80,4% |
| Macro-F1 (test set, 97 hojas) | 0,742 |
| Coincidencia con el modelo completo en PyTorch | 90% de las hojas |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repo ocupa 0,3 GB y el formato q4 está pensado para ejecución en navegador, por lo que la huella es reducida.
- GPU recomendadas: no aplica para el despliegue objetivo (ONNX Runtime Web en navegador); para ejecución en servidor, cualquier GPU con suficiente memoria para SigLIP-base y Qwen2-0.5B sería suficiente, aunque no se especifican modelos concretos.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna, dado el tamaño de los componentes; no se dispone de cifras oficiales.
- Opciones de despliegue: ONNX Runtime Web (objetivo principal); también podría ejecutarse con ONNX Runtime en servidor, aunque no está documentado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (VLM de dominio agrícola exportados a ONNX para navegador) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado específicamente para deficiencias nutricionales en hojas de café (9 clases); no es un modelo de propósito general.
- Conjunto de test pequeño (97 hojas): la precisión del 80,4% y el macro-F1 de 0,742 deben interpretarse con cautela por el tamaño muestral.
- El 10% de las hojas no coinciden con la predicción del modelo completo en PyTorch, lo que indica una degradación por la cuantización q4 y la exportación a ONNX.
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero no se especifican restricciones adicionales.
- No se dispone de información sobre el contexto máximo ni sobre el comportamiento del modelo de lenguaje subyacente en tareas fuera de la clasificación.
- Para producción, conviene validar el modelo con un conjunto de imágenes propio del cultivo y condiciones de captura reales antes de confiar en sus predicciones.

## Enlaces

- [HuggingFace: Sasaki2801/plantvlm-srp-browser](https://huggingface.co/Sasaki2801/plantvlm-srp-browser)
- [Demo en Hugging Face Spaces](https://huggingface.co/spaces/Sasaki2801/plantvlm-srp-demo)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
