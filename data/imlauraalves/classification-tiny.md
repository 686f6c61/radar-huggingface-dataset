# imlauraalves/classification-tiny

## Resumen

`imlauraalves/classification-tiny` es un repositorio experimental de HuggingFace que contiene una implementación propia de una arquitectura MobileViT orientada a clasificación de imágenes. Lo publica el usuario imlauraalves el 19 de octubre de 2026, con licencia BSD-3-Clause y un único checkpoint en formato safetensors de 33.088 parámetros totales. No es un modelo entrenado: la propia model card indica explícitamente que `model.safetensors` es "a valid initialization checkpoint for smoke tests" y que no se presenta como un checkpoint evaluado.

El problema que resuelve no es de inferencia, sino de andamiaje: sirve como base reproducible para inspeccionar cambios de arquitectura antes de lanzar un entrenamiento completo. El repositorio incluye `inference.py` como artefacto principal, `config.json` con los ajustes de arquitectura generados, `training_args.json` con la receta de experimento por defecto (optimizador Adafactor con schedule de tipo step) y un README que documenta explícitamente la ausencia de métricas.

Su relevancia actual es muy limitada fuera del ámbito de prototipado: no hay benchmarks, no hay dataset documentado, no hay número de clases ni resolución de entrada especificados, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta. Además, existe una incoherencia interna notable: la model card declara `Scale: giant`, pero el recuento real de parámetros en safetensors es de 33.088, cuatro órdenes de magnitud por debajo de lo que ese término sugiere en la literatura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileViT (híbrida CNN-transformer, según tags y model card); atención estándar, fusión Tucker, activación ReLU, normalización ScaleNorm |
| Parametros totales | 33.088 (dato real extraído del safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de visión por clasificación; no se documenta resolución de entrada) |
| Tipos de cuantizacion | No disponible (solo se distribuye un checkpoint de inicialización en safetensors) |
| Idiomas soportados | No disponible (tarea de clasificación visual; no se documentan etiquetas ni clases) |
| Licencia | BSD-3-Clause |
| Formato de pesos | `model.safetensors` (inicialización) + código PyTorch en `inference.py`; tamaño del repo 0.0 GB |

| Metadato adicional | Valor |
|---|---|
| Autor | imlauraalves |
| Fecha de creación | 2026-10-19 |
| Última actualización | 2026-10-19 |
| Descargas / likes | 0 / 0 |
| Pipeline declarado en HuggingFace | No disponible |
| Optimizador por defecto | Adafactor con schedule `step` |
| Escala declarada en la card | `giant` (inconsistente con los 33.088 parámetros reales) |

## Arquitectura y entrenamiento

La arquitectura declarada es MobileViT, una familia híbrida que combina convoluciones y bloques de atención para visión, pensada originalmente para despliegue en dispositivos móviles. La model card concreta cuatro decisiones: atención `standard` (no lineal ni efficient), fusión `tucker`, activación `relu` y normalización `scalenorm`. No se especifica profundidad, número de cabezas, dimensión de embedding, resolución de entrada ni número de clases de salida; `config.json` los contendría, pero no se han proporcionado.

No hay evidencia de entrenamiento. La receta incluida en `training_args.json` (Adafactor con schedule `step`) se describe como "starting values in the script, not evidence of a completed run". No se documentan tokens de entrenamiento, composición del dataset, ni fases de RLHF/DPO o ajuste supervisado. Tampoco se documentan innovaciones técnicas más allá de los cuatro parámetros arquitectónicos citados, y la propia card recomienda evaluar con "a task-specific labeled split, report the task metric across at least three seeds, and include a matched-capacity baseline".

## Capacidades

- Inicialización de un grafo MobileViT con los ajustes declarados (atención estándar, fusión Tucker, ReLU, ScaleNorm), ejecutable mediante el entry point de `inference.py`.
- Smoke test de carga de pesos en safetensors y de forward pass; la card menciona un ejemplo de prueba generado en el bloque `__main__` del script.
- Punto de partida para modificaciones de arquitectura antes de un entrenamiento completo, según el propósito declarado por el autor.
- Clasificación de imágenes como tarea objetivo del código, aunque sin pesos entrenados ni etiquetas documentadas.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni generación de texto: no es un modelo de lenguaje.
- No se declaran capacidades multilingües, de visión generativa, audio ni modo "thinking".
- Carga mediante APIs automáticas genéricas: la card advierte que, al ser una implementación custom, requiere un adaptador explícito.

## Casos de uso

- Prototipado de arquitectura: usar el repositorio como esqueleto para probar variantes de MobileViT (cambiar fusión Tucker por concatenación, ScaleNorm por BatchNorm) antes de comprometer presupuesto de entrenamiento, ya que el forward pass es ejecutable con 33.088 parámetros.
- Smoke test de pipelines de entrenamiento: validar que el bucle de entrenamiento, el logging y el guardado de checkpoints funcionan contra un modelo de 33.088 parámetros antes de escalar a un backbone real, reduciendo el coste de depuración a segundos por iteración.
- Verificación de carga de safetensors en CI: incluir `inference.py --help` y una instantiation del modelo en un job de integración continua para detectar roturas de compatibilidad con versiones de PyTorch o de la librería de serialización.
- Material docente: ilustrar la diferencia entre un checkpoint de inicialización y un checkpoint entrenado, y mostrar por qué una model card sin métricas no permite afirmar capacidad alguna.
- Plantilla de documentación de experimentos: reutilizar la estructura `config.json` + `training_args.json` + README para registrar la receta (Adafactor, schedule step) y las semillas de un experimento reproducible.
- Base para un baseline de capacidad comparable: la recomendación de la card de incluir "a matched-capacity baseline" convierte este repositorio en el punto de partida para construir una comparación controlada por parámetros y exposición de datos.
- No apto para producción: inferencia real sobre imágenes de usuario, moderación de contenido visual o cualquier flujo con SLA requiere un checkpoint entrenado y auditado, que este repositorio no ofrece.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente: "No benchmark score is claimed in this repository", y añade que el checkpoint no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precisión; con 33.088 parámetros, los pesos en fp32 ocupan del orden de 130 KB.
- GPU recomendadas: ninguna en particular; el modelo cabe holgadamente en cualquier GPU consumer, e incluso en CPU.
- Cabe en GPU consumer: sí, en cualquier modelo (RTX 3060, RTX 4090, GTX 1650, etc.), con un consumo de memoria despreciable frente al resto del sistema.
- Opciones de despliegue: PyTorch eager a través de `inference.py`; vLLM, TGI, llama.cpp u Ollama no aplican porque son servidores para modelos generativos de lenguaje, no para clasificación visual. Para servir clasificación en producción haría falta exportar a TorchScript u ONNX, algo no documentado en el repositorio.
- Latencia y throughput estimados: no disponibles. Dado el tamaño, el cuello de botella real sería el preprocesado de imagen y el pipeline de datos, no el modelo.
- Almacenamiento: el repositorio ocupa 0.0 GB según HuggingFace, coherente con un checkpoint de inicialización mínimo.

## Comparativa con modelos similares

Los valores de las alternativas provienen de documentación pública de referencia y no de la información proporcionada en esta ficha; se incluyen como orden de magnitud.

| Modelo | Parámetros | Contexto / entrada | Licencia | Disponibilidad | Estado |
|---|---|---|---|---|---|
| `imlauraalves/classification-tiny` | 33.088 | No documentada | BSD-3-Clause | HuggingFace, 0 descargas | Checkpoint de inicialización, sin entrenar |
| MobileNetV3-Small (referencia torchvision) | ~2,5 M | Resolución de imagen configurable | BSD-3-Clause (código de referencia) | Amplia, pesos preentrenados en ImageNet | Entrenado y evaluado |
| ResNet-18 (referencia torchvision) | ~11,7 M | Resolución de imagen configurable | BSD-3-Clause (código de referencia) | Amplia, pesos preentrenados en ImageNet | Entrenado y evaluado |
| ViT-Base/16 (referencia) | ~86 M | 224x224 típicamente | Según implementación (a menudo Apache-2.0) | Amplia | Entrenado y evaluado |

La comparación relevante no es de rendimiento, sino de estado: los tres backbones de referencia publican pesos entrenados y métricas en ImageNet, mientras que este repositorio solo publica una inicialización. Cualquier comparación cuantitativa exigiría entrenar `classification-tiny` con la misma exposición de datos y presupuesto de tuning, tal como indica su propia model card.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: cualquier salida del forward pass es numéricamente válida pero semánticamente arbitraria. No debe interpretarse como predicción.
- Ausencia total de benchmarks, curvas de aprendizaje o métricas de validación; la card lo declara de forma explícita.
- No se documentan sesgos porque no hay datos de entrenamiento que auditar; la card indica que el checkpoint "has not been trained or audited for robustness, fairness, or domain transfer".
- Riesgo de alucinación: no aplica en sentido estricto al no ser un modelo generativo, pero sí existe riesgo de atribuirle capacidades que no tiene si se cita fuera de contexto.
- Incoherencia documental: la card declara `Scale: giant` mientras que el safetensors contiene 33.088 parámetros. Conviene tratar cualquier afirmación de escala de la card con escepticismo.
- Sin información sobre resolución de entrada, número de clases, normalización de píxeles ni espacio de etiquetas, lo que impide un uso directo incluso como extractor de características.
- Requiere adaptador explícito: las APIs automáticas de carga de HuggingFace no funcionarán sin código adicional, según advierte el autor.
- Licencia BSD-3-Clause: permite uso comercial y modificación, con obligación de conservar el aviso de copyright, incluir la licencia y no usar el nombre del autor para promocionar derivados. La card añade que deben revisarse por separado los términos de los datos de origen si se usan datasets externos.
- Repositorio sin tracción: 0 descargas y 0 likes, sin señales de mantenimiento posterior a la fecha de creación.
- Tamaño de repo 0.0 GB: si los ficheros son punteros LFS o el redondeo oculta el contenido real, conviene verificar la descarga completa antes de integrarlo en un pipeline.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/imlauraalves/classification-tiny
- No se han encontrado papers, blogs, repositorios auxiliares ni demos en la información proporcionada.
