# Lightricks/LTX-2.3-22b-IC-LoRA-In-Outpainting

## Resumen

LTX-2.3-22b-IC-LoRA-In-Outpainting es un adaptador LoRA de tipo IC-LoRA (in-context LoRA) desarrollado por Lightricks sobre el modelo base LTX-2.3, un modelo de difusión de vídeo de 22.000 millones de parámetros. El adaptador añade dos capacidades de edición sobre el modelo base: inpainting, que permite rellenar o eliminar una región enmascarada dentro del fotograma (por ejemplo, borrar a una persona o sustituir un objeto), y outpainting, que extiende el lienzo más allá de los límites originales del vídeo generando contenido coherente con el contexto existente.

El modelo se distribuye como un único fichero de difusión (librería `diffusion-single-file`) de aproximadamente 1,3 GB, lo que corresponde al peso del adaptador y no al modelo base completo. Está pensado para flujos de trabajo de vídeo-a-vídeo en ComfyUI y en el ecosistema de inferencia oficial de LTX-2, y se apoya en la arquitectura DiT (Diffusion Transformer) del modelo base, que integra generación de vídeo con audio sincronizado.

Su relevancia actual radica en que habilita tareas de edición de vídeo de producción (borrado de objetos, reencuadre, extensión de plano) sin necesidad de reentrenar el modelo fundacional, mediante un adaptador ligero. El acceso está restringido en Hugging Face y requiere aceptar la licencia comunitaria de LTX-2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) sobre el modelo base LTX-2.3; adaptador IC-LoRA |
| Parametros totales | 22.000 millones (modelo base LTX-2.3); tamaño del adaptador no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión de vídeo; ventana temporal no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | ltx-2-community-license (acceso restringido, requiere aceptación) |
| Formato de pesos | diffusion-single-file (fichero único de difusión; safetensors no confirmado) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre LTX-2.3-22B, un modelo fundacional de difusión de vídeo basado en arquitectura DiT que, según la documentación oficial de Lightricks, integra generación de vídeo y audio sincronizados en un único modelo. El IC-LoRA es un adaptador de bajo rango que condiciona al modelo base mediante contexto visual (máscara y fotogramas de referencia) para resolver las tareas de inpainting y outpainting sin modificar los pesos del modelo fundacional.

No se dispone de información sobre el volumen de datos de entrenamiento del adaptador, la composición del dataset, ni si se emplearon técnicas de ajuste por preferencias (RLHF/DPO). Tampoco se detallan innovaciones específicas del adaptador más allá del mecanismo IC-LoRA, que permite reutilizar el mismo adaptador en versiones posteriores del modelo base: la documentación de LTX indica que el IC-LoRA de inpainting/outpainting de LTX-2.3 se reutiliza con los pesos de LTX-2.5.

## Capacidades

- Inpainting de vídeo: relleno o eliminación de regiones enmascaradas dentro del fotograma, como borrar una persona o sustituir un objeto.
- Outpainting de vídeo: extensión del lienzo más allá de los bordes originales generando contenido coherente con el plano existente.
- Edición vídeo-a-vídeo: el pipeline declarado es `video-to-video`, por lo que opera sobre material de vídeo existente.
- Integración con flujos IC-LoRA en ComfyUI y en el ecosistema de inferencia oficial de LTX-2.
- Compatibilidad declarada con los pesos de LTX-2.5 para las mismas tareas de edición.
- Capacidades del modelo base (audio sincronizado, alta fidelidad, múltiples modos de rendimiento) heredadas de LTX-2.3, aunque el adaptador se centra en edición espacial.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje).
- Capacidades multilingües: limitadas al inglés (`en`) según los metadatos.

## Casos de uso

- Eliminación de objetos en postproducción: se enmascara el elemento no deseado (una persona, un cartel, un vehículo) y el adaptador rellena la región con contenido coherente con el resto del plano, evitando un nuevo rodaje.
- Reencuadre de material rodado en formato horizontal a vertical: el outpainting extiende el lienzo por los laterales para adaptar un plano 16:9 a 9:16 para redes sociales, generando el contenido que falta.
- Limpieza de metraje de archivo: se eliminan marcas de agua, logotipos o elementos obsoletos de vídeos históricos antes de reutilizarlos en un montaje.
- Corrección de continuidad: cuando un objeto aparece en un plano y desaparece en el siguiente, el inpainting permite borrarlo de forma selectiva para mantener la coherencia narrativa.
- Creación de extensiones de plano para transiciones: el outpainting genera margen adicional alrededor de un plano para permitir movimientos de cámara virtuales o transiciones con desplazamiento en edición.
- Prototipado rápido en publicidad: agencias que necesitan variantes de un mismo anuncio con distintos objetos o encuadres pueden generar las variantes con el adaptador en lugar de regrabar, reduciendo costes de producción.
- Flujos automatizados en ComfyUI: integración del IC-LoRA en grafos de nodos para procesar lotes de clips con máscaras predefinidas, útil en pipelines de contenido a escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El adaptador ocupa 1,3 GB, pero requiere cargar el modelo base LTX-2.3 de 22.000 millones de parámetros, cuyo consumo de VRAM no se detalla.
- GPU recomendadas: no disponible. Por el tamaño del modelo base (22B), se requiere previsiblemente hardware de gama alta de centro de datos, pero no se confirma en la documentación consultada.
- Viabilidad en GPU de consumo: no disponible; no se confirma que quepa en tarjetas consumer.
- Opciones de despliegue: flujos IC-LoRA en ComfyUI y el repositorio oficial de inferencia LTX-2 (GitHub Lightricks/LTX-2). Soporte de vLLM, llama.cpp, Ollama o TGI: no aplicable (modelo de difusión, no de lenguaje).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones comparables de otros adaptadores de inpainting/outpainting de vídeo en la información proporcionada. La única comparación documentada es interna al ecosistema Lightricks: el mismo IC-LoRA se reutiliza con los pesos de LTX-2.5, lo que indica compatibilidad hacia adelante dentro de la familia LTX.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LTX-2.3-22b-IC-LoRA-In-Outpainting | 22B (base) | no disponible | ltx-2-community-license | Hugging Face, acceso restringido |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Acceso restringido: el repositorio está gated y exige aceptar la licencia comunitaria de LTX-2 en Hugging Face antes de la descarga.
- Licencia `ltx-2-community-license`: no es una licencia de código abierto estándar; es imprescindible revisar sus términos antes de cualquier uso comercial.
- Idioma: los metadatos declaran únicamente inglés (`en`); el comportamiento con prompts en otros idiomas no está garantizado.
- Dependencia del modelo base: el adaptador no funciona de forma autónoma; requiere los pesos de LTX-2.3 (22B), lo que condiciona los requisitos de hardware y almacenamiento.
- Riesgo de artefactos: como todo modelo generativo de difusión, puede producir contenido incoherente en las regiones rellenadas o extendidas, especialmente en máscaras grandes o planos con movimiento complejo.
- Sesgos: no se documentan sesgos específicos del adaptador; al heredar el modelo base, puede reproducir los sesgos presentes en sus datos de entrenamiento.
- Alucinación visual: el outpainting puede generar contenido plausible pero incorrecto respecto a la escena original; requiere revisión humana en producción.
- Sin datos de benchmarks ni de requisitos de hardware publicados en la información disponible, lo que dificulta la planificación de despliegues.

## Enlaces

- Hugging Face: https://huggingface.co/Lightricks/LTX-2.3-22b-IC-LoRA-In-Outpainting
- Modelo base: https://huggingface.co/Lightricks/LTX-2.3
- Repositorio oficial de inferencia y entrenador LoRA: https://github.com/Lightricks/LTX-2
- Documentación de inpainting y outpainting: https://docs.ltx.io/open-source-model/feature-guides/editing-effects/in-outpainting
- Sitio corporativo de Lightricks: https://www.lightricks.com/
- Sobre Lightricks: https://www.lightricks.com/about
