# prithivMLmods/Qwen3.5-4B-3D-Coder-MLX

## Resumen

Qwen3.5-4B-3D-Coder-MLX es una conversión al formato MLX del modelo Qwen3.5-4B-3D-Coder, un ajuste fino independiente desarrollado por ccore sobre la base Qwen3.5-4B. El modelo está especializado en generación de código y, de forma destacada, en la creación de escenas 3D interactivas autocontenidas mediante Three.js, HTML y JavaScript. Esta versión MLX ha sido publicada por prithivMLmods para su ejecución nativa en hardware Apple Silicon a través de la librería mlx-vlm.

El modelo resuelve un nicho concreto: producir archivos HTML completos y ejecutables que renderizan escenas 3D interactivas (con OrbitControls, iluminación, animaciones y geometría low-poly), tanto a partir de una descripción textual como de una imagen de referencia. Con 4.539.265.536 parámetros totales y una ventana de contexto que no se detalla en la información disponible, se posiciona como una herramienta práctica para prototipado rápido de visualizaciones 3D en el navegador.

La relevancia de esta ficha radica en que combina tres factores poco habituales: un fine-tune especializado en un dominio muy concreto (Three.js), una pipeline multimodal image-text-to-text y una distribución en dos variantes de precisión (BF16 y 8-bit) optimizadas para el ecosistema MLX de Apple. La licencia Apache-2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Qwen3.5-4B; pesos en formato MLX |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (raiz del repo) y 8-bit (subcarpeta `8-bit`); el modelo base ofrece ademas Q4_K_M y Q8_0 en GGUF, pero no se confirma su presencia en este repo MLX |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX); repo de 14,2 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen3.5-4B de ccore, que a su vez parte de Qwen3.5-4B. La arquitectura subyacente es un transformer multimodal con capacidad de procesar imagen y texto (pipeline image-text-to-text), adaptado al runtime MLX mediante mlx-vlm. El ajuste fino se realizó sobre el dataset ccore/ThreeJS-3D-Scenes, con licencia MIT, compuesto por 4.146 ejemplos que incluyen prompts, trazas de razonamiento, código completo y etiquetas de complejidad. Este dataset orienta el entrenamiento hacia la generación de escenas Three.js autocontenidas.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset más allá de los 4.146 ejemplos, ni si se aplicaron técnicas de RLHF o DPO. El autor menciona un checkpoint del 27 de octubre que, según se reporta, mejora la generación one-shot y la calidad de las escenas. La model card indica que los usuarios de LM Studio deben desactivar la predicción multi-token (multi-token prediction), lo que sugiere que el modelo base incorpora algún mecanismo de decodificación especulativa o MTP, aunque no se detalla su funcionamiento.

## Capacidades

- Generación de código en HTML y JavaScript para escenas 3D con Three.js, incluyendo geometría, materiales, iluminación, animaciones y controles de cámara (OrbitControls).
- Generación de escenas 3D a partir de una descripción textual (text-to-3D scene).
- Generación de escenas 3D condicionada por una imagen de referencia (image-conditioned 3D scene generation), recreando escena e iluminación.
- Producción de archivos HTML autocontenidos y ejecutables en el navegador.
- Razonamiento de código y trazas de razonamiento, según el dataset de entrenamiento.
- Capacidad de codificación general, según se describe en la model card ("general-purpose coding").
- Soporte de conversación multi-turno (tag "conversational").
- Capacidades multimodales de entrada imagen + texto.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico multi-paso en la información disponible.

## Casos de uso

- Prototipado rápido de escenas 3D en el navegador: un desarrollador describe una escena (por ejemplo, "isla flotante low-poly con molinos animados y OrbitControls") y el modelo devuelve un HTML completo con Three.js listo para abrir en el navegador, acelerando la exploración de ideas visuales.
- Recreación de escenas a partir de referencias visuales: dado un mockup o una captura de una escena 3D, el modelo genera el código Three.js equivalente, útil para convertir diseños en prototipos funcionales.
- Generación de demos interactivas para documentación o presentaciones: el modelo produce visualizaciones 3D autocontenidas que pueden incrustarse en páginas web o demos técnicas sin dependencias externas más allá de Three.js.
- Herramienta educativa para aprender Three.js: las trazas de razonamiento y el código completo permiten usar el modelo como generador de ejemplos didácticos de escenas 3D con distintos niveles de complejidad.
- Integración en flujos de trabajo locales en Apple Silicon: gracias a MLX y a la variante 8-bit, puede ejecutarse en un Mac para generar escenas 3D sin depender de servicios en la nube, útil en entornos con requisitos de privacidad.
- Generación de contenido para videojuegos o experiencias web: creación de escenarios 3D simples y animados que sirven como base para prototipos de niveles o entornos interactivos.
- Automatización de assets visuales en pipelines de diseño: el modelo puede generar variantes de una escena cambiando parámetros del prompt (iluminación, cámara, geometría), facilitando la iteración rápida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se proporcionan resultados cuantitativos y que la evaluación se demuestra mediante escenas 3D de ejemplo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia orientativa por tamaño (4.539 millones de parámetros), la variante BF16 requiere del orden de 9 GB solo para pesos, y la variante 8-bit alrededor de 4,5 GB; el repo completo ocupa 14,2 GB.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (chips M1, M2, M3, M4 y superiores). No se documenta soporte para GPU NVIDIA en esta variante.
- Cabe en hardware consumer: sí, en equipos Apple Silicon con memoria unificada suficiente; la variante 8-bit reduce el requisito aproximadamente a la mitad respecto a BF16.
- Opciones de despliegue: mlx-vlm (CLI y API Python). El modelo base dispone de builds GGUF (Q4_K_M y Q8_0) para otros runtimes, pero no se confirma su disponibilidad en este repositorio MLX. Para LM Studio se recomienda desactivar la predicción multi-token.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-3D-Coder-MLX (este) | 4.539 M | No disponible | Codigo + escenas Three.js, MLX | Apache-2.0 | Hugging Face (MLX) |
| Qwen3.5-4B-3D-Coder (base) | 4B aprox. | No disponible | Codigo + escenas Three.js | Apache-2.0 | Hugging Face (safetensors FP16, GGUF Q4_K_M/Q8_0) |
| Qwen3.5-4B-3D-Coder-GGUF | 4B aprox. | No disponible | Codigo + escenas Three.js, formato GGUF | Apache-2.0 | Hugging Face (GGUF) |
| Qwen3.5-4B (base original) | 4B aprox. | No disponible | Modelo general multimodal | No disponible en la informacion | Hugging Face |

La comparativa se limita a variantes del mismo linaje, ya que no se dispone de datos de rendimiento ni de modelos alternativos especializados en Three.js con los que contrastar de forma rigurosa.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en inglés; el soporte de otros idiomas no está garantizado.
- Es un "early-preview": el autor advierte que algunas generaciones pueden requerir reintentos o correcciones menores de código.
- No se han publicado benchmarks cuantitativos, por lo que la calidad real en tareas de código general no está medida de forma objetiva.
- Riesgo de alucinación en APIs de Three.js o en la estructura del HTML generado; conviene validar el código antes de usarlo en producción.
- La longitud de contexto no está documentada, lo que dificulta planificar tareas con prompts largos o escenas muy complejas.
- En LM Studio es necesario desactivar la predicción multi-token; no hacerlo puede degradar la generación.
- Aunque la licencia es Apache-2.0 (permisiva para uso comercial), el modelo deriva de Qwen3.5-4B y de un dataset MIT; conviene revisar las condiciones de los componentes base.
- El formato MLX limita el despliegue a hardware Apple Silicon; para otros entornos habría que recurrir a las variantes GGUF del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prithivMLmods/Qwen3.5-4B-3D-Coder-MLX
- Modelo base (fine-tune): https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- Modelo original Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Variante GGUF: https://huggingface.co/prithivMLmods/Qwen3.5-4B-3D-Coder-GGUF
- Variante MTP-Repacked: https://huggingface.co/prithivMLmods/Qwen3.5-4B-3D-Coder-MTP-Repacked
- Dataset ThreeJS-3D-Scenes: https://huggingface.co/datasets/ccore/ThreeJS-3D-Scenes
- mlx-vlm (repositorio): https://github.com/Blaizzy/mlx-vlm
- MLX (repositorio): https://github.com/ml-explore/mlx
- Licencia Apache 2.0: https://huggingface.co/datasets/choosealicense/licenses/blob/main/markdown/apache-2.0.md
