# EllipsesMark/Sheet_Generator_H3_PoopMan333

## Resumen

Este repositorio contiene un workflow de ComfyUI, no un modelo de pesos propio, diseñado para generar hojas de personaje (character sheets) con consistencia visual mediante el modelo de video MiniMax H3. El autor, EllipsesMark, lo creó para resolver el problema de obtener imágenes de referencia precisas y coherentes para el propio H3, aprovechando la capacidad del modelo de aceptar hasta 9 imágenes de referencia y mantener la identidad del personaje a lo largo de una rotación de 360 grados.

El workflow genera un video de giro lento sin cortes, extrae 6 u 8 fotogramas (según la versión) y los compone en una hoja de referencia reutilizable. Incluye dos variantes: una de 6 paneles (frontal, laterales, trasero y dos primeros planos) y otra de 4 paneles más rápida. También ofrece la opción de exportar el video completo y los fotogramas individuales. El modelo subyacente es MiniMax H3, un modelo de video de código abierto con arquitectura de transformer y atención de alta calidad, aunque los detalles técnicos completos no se especifican en la documentación proporcionada.

La relevancia actual radica en que aborda un problema común en la generación de imágenes: la inconsistencia entre imágenes del mismo personaje. Al usar un modelo de video, los fotogramas comparten el mismo pase de generación, lo que garantiza coherencia en rasgos, vestimenta y color. El workflow está pensado para artistas, diseñadores de juegos y creadores de contenido que necesitan referencias estables para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Workflow de ComfyUI basado en el modelo de video MiniMax H3 (transformer) |
| Parametros totales | no disponible (depende del modelo MiniMax H3 subyacente) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica, es un modelo de video) |
| Tipos de cuantizacion | INT8 para los modelos de difusion, text encoder y VAE; FP32 para el audio VAE; BF16 para la LoRA turbo opcional |
| Idiomas soportados | no disponible (los prompts se escriben en ingles, pero no se especifica soporte multilingue) |
| Licencia | minimax-h3-community-license (licencia de comunidad de MiniMax) |
| Formato de pesos | JSON para el workflow; safetensors para los modelos (diffusion, text encoder, VAE, LoRA) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado desde cero, sino un workflow de ComfyUI que orquesta el modelo MiniMax H3. MiniMax H3 es un modelo de generacion de video de codigo abierto desarrollado por MiniMax, con arquitectura de transformer y capacidad de referencia multi-imagen (hasta 9 imagenes de entrada). El workflow aprovecha esta capacidad para construir un personaje a partir de fragmentos visuales (cara, armadura, sombrero) y generar un video de rotacion lenta sin cortes.

El proceso de entrenamiento del workflow en si no es relevante; el modelo subyacente fue entrenado por MiniMax con datos de video e imagen, aunque no se proporcionan detalles sobre el dataset, el numero de tokens o el uso de RLHF/DPO. La innovacion tecnica del workflow reside en el prompt estructurado: un prompt A (descripcion de las imagenes de entrada) y un prompt B (control de giro, pose, iluminacion) que se combinan para guiar la generacion. El workflow genera 124 fotogramas para extraer 6, lo que garantiza consistencia pero resulta lento.

## Capacidades

- Generacion de hojas de personaje con rotacion de 360 grados (o 180 en la version de 4 paneles) a partir de hasta 9 imagenes de referencia.
- Consistencia de personaje entre fotogramas gracias a la generacion de video sin cortes.
- Combinacion de elementos de distintas imagenes: cara de una, armadura de otra, accesorios de una tercera.
- Conversion de anime a realista (modificacion del prompt B) con resultados notables, como se muestra en los ejemplos de Haruhi y Sanji.
- Generacion de objetos con multiples angulos, recomendando proporcionar mas vistas de referencia.
- Exportacion opcional del video de giro completo y de fotogramas individuales para su uso como referencias posteriores.
- Integracion con ComfyUI mediante nodos nativos y opcionales (KJNodes, rgthree) para aceleracion.

## Casos de uso

- Diseño de personajes para videojuegos: los artistas pueden crear hojas de referencia de un personaje desde bocetos o imagenes sueltas, garantizando que el modelo 3D o las ilustraciones posteriores mantengan coherencia en cada angulo.
- Produccion de animacion 2D: un estudio puede generar un turnaround de un personaje para usarlo como guia de dibujo en todas las escenas, evitando errores de proporciones o vestimenta.
- Creacion de contenido para comics y novelas graficas: el autor puede definir un personaje una vez y reutilizar la hoja para mantener la consistencia en multiples paginas o capitulos.
- Desarrollo de personajes para IA conversacional o avatares: se puede generar una hoja de referencia para un avatar virtual que se usara en diferentes poses o expresiones.
- Prototipado rapido de conceptos: un diseñador puede combinar imagenes de referencia de distintas fuentes (ropa, peinado, accesorios) para explorar variaciones de un personaje sin redibujar desde cero.
- Conversion de personajes anime a estilo realista: util para adaptar personajes de series o juegos a un estilo fotorealista, manteniendo la identidad visual, como se demuestra con los ejemplos de Haruhi y Sanji.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas cuantitativas de rendimiento, solo indicaciones cualitativas sobre la calidad de la consistencia y la velocidad relativa entre las dos versiones del workflow (la de 4 paneles es aproximadamente un 40% mas rapida que la de 6 paneles).

## Requisitos de hardware

- No se especifican requisitos exactos de VRAM en la documentacion. Los modelos se ofrecen en versiones INT8 de baja VRAM, lo que sugiere que pueden ejecutarse en GPUs de consumo con al menos 16 GB de VRAM, aunque no se confirma.
- Se recomienda una GPU con suficiente memoria para el modelo de video MiniMax H3; probablemente una RTX 4090 (24 GB) o superior sea adecuada, pero no esta indicado.
- El workflow esta diseñado para ComfyUI, por lo que se requiere una instalacion funcional de ComfyUI con los nodos personalizados opcionales (KJNodes, rgthree) si se desea usar el grupo de aceleracion.
- Los modelos se cargan automaticamente desde HuggingFace mediante los nodos de descarga integrados, lo que simplifica el despliegue.
- La generacion de 124 fotogramas implica una latencia considerable; no se proporcionan cifras de throughput, pero el autor advierte que es "lento".

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en el mismo repositorio. Existen otras herramientas de generacion de hojas de personaje, como el "AI Model Sheet Generator" de LimeAILab, pero no se proporcionan datos tecnicos ni benchmarks para establecer una comparacion rigurosa. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El proceso es lento: se generan 124 fotogramas para utilizar solo 6, lo que puede resultar impractico para iteraciones rapidas.
- La calidad de la consistencia depende en gran medida de la redaccion del prompt A: es necesario describir explicitamente que elementos conservar y cuales ignorar, ya que los fondos o accesorios no deseados pueden filtrarse.
- La vestimenta tiende a derivar si no se describe en palabras; las caras se mantienen mejor que la ropa.
- El modelo puede tener sesgos visuales inherentes a sus datos de entrenamiento, aunque no se documentan en este repositorio.
- La licencia minimax-h3-community-license puede imponer restricciones de uso comercial; se recomienda revisar los terminos completos en el enlace proporcionado.
- No se garantiza soporte multilingue; los prompts se escriben en ingles y no se menciona compatibilidad con otros idiomas.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/EllipsesMark/Sheet_Generator_H3_PoopMan333
- Licencia de MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Repositorio de GitHub del prompt writer (herramienta complementaria): https://github.com/EllipsesMark/H3-PromptWriter
