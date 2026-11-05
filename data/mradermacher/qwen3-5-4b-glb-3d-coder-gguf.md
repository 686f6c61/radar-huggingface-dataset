# mradermacher/Qwen3.5-4B-GLB-3D-Coder-GGUF

## Resumen

Qwen3.5-4B-GLB-3D-Coder-GGUF es la versión cuantizada en formato GGUF del modelo ccore/Qwen3.5-4B-GLB-3D-Coder, un modelo de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) especializado en generación de código para gráficos 3D, Three.js, archivos GLB y Godot. La cuantización la ha realizado mradermacher, un conocido creador de quants estáticos para la comunidad de llama.cpp, publicada el 5 de noviembre de 2026 bajo licencia Apache 2.0.

El modelo base parte de la familia Qwen3.5, lo que sitúa su arquitectura en la línea de transformers densos de Alibaba, aunque la model card no detalla la arquitectura interna ni la longitud de contexto. El interés principal de esta ficha reside en el empaquetado GGUF: ofrece un abanico de cuantizaciones desde Q2_K (2,0 GB) hasta f16 (8,5 GB), además de dos suplementos multimodales (mmproj en Q8_0 y f16), lo que indica que el modelo base incorpora capacidades de visión.

Es relevante ahora porque permite ejecutar un modelo de código 3D especializado en hardware de consumo, algo poco habitual en el ecosistema de generación de escenas Three.js y assets GLB. No obstante, el repositorio no incluye benchmarks, detalles de entrenamiento ni documentación de contexto, por lo que muchas especificaciones quedan marcadas como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (familia Qwen3.5, presumiblemente transformer denso) |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La model card del repositorio GGUF no aporta información sobre la arquitectura interna del modelo base, los datos de entrenamiento, el número de tokens procesados ni si hubo fases de RLHF o DPO. Lo único deducible es que se trata de un modelo derivado de Qwen3.5 (etiqueta `qwen3_5`), de tamaño 4B, afinado específicamente para código relacionado con 3D: Three.js, archivos GLB y Godot. La presencia de archivos `mmproj` confirma que el modelo base es multimodal, es decir, que acepta entrada de imágenes además de texto.

La innovación técnica de este repositorio concreto es la cuantización estática realizada por mradermacher con `quantize_version: 2` y `output_tensor_quantised: 1`, a partir de los pesos en formato HuggingFace. El autor indica que no ha publicado cuantizaciones con imatrix (weighted) para este modelo, por lo que solo están disponibles las estáticas. No se documentan técnicas como decodificación especulativa, atención lineal ni modos de razonamiento extendido.

## Capacidades

- Generación de código para gráficos 3D: escenas Three.js, materiales, geometrías y animaciones.
- Generación y manipulación de archivos GLB (formato binario de glTF) para assets 3D.
- Código para el motor Godot, presumiblemente GDScript y escenas.
- Capacidades multimodales: los archivos `mmproj` indican soporte de entrada de imagen, aunque no se detalla su alcance.
- Conversación multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere uso vía API compatible con OpenAI.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la metadata.

## Casos de uso

- Prototipado rápido de escenas Three.js: el modelo puede generar código de inicialización de escena, cámara, luces y objetos a partir de una descripción textual, adecuado para equipos que iteran sobre demos web 3D.
- Generación de assets GLB en pipelines de contenido: integrado en un script que produzca variantes de modelos 3D o los transforme, gracias a su especialización en el formato GLB.
- Desarrollo de videojuegos en Godot: asistencia para escribir GDScript de comportamientos, controladores de cámara o carga de recursos 3D, con la ventaja de ejecutarse localmente en una estación de trabajo.
- Asistente de código en el IDE para proyectos de visualización 3D: al caber en GPU de consumo en cuantización Q4_K_M (2,8 GB), puede desplegarse con Ollama o llama.cpp junto al editor sin depender de la nube.
- Análisis de capturas o diagramas de escenas 3D: la componente multimodal permite adjuntar una imagen de referencia y pedir código que la reproduzca, útil en herramientas de diseño.
- Educación y experimentación: modelo ligero para que estudiantes de gráficos por computador practiquen generación de código 3D en local, sin coste de API.
- Automatización de tareas de conversión de formatos: combinado con scripts de preprocesado, puede generar código de importación/exportación entre glTF, GLB y otros formatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2,0 GB (Q2_K) y 4,6 GB (Q8_0); f16 requiere unos 8,5 GB. Los archivos `mmproj` añaden 0,5-0,8 GB si se usa la entrada multimodal.
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM es suficiente para las cuantizaciones Q4-Q8; una RTX 3060, RTX 4060, RTX 4090 o A100 pueden ejecutarlo sobradamente.
- Cabe en GPU de consumo: sí, incluso en tarjetas de gama media con 6 GB (Q4_K_M ocupa 2,8 GB).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF como llama-cpp-python; para la versión multimodal se requiere un runtime con soporte de `mmproj` (llama.cpp reciente).
- Latencia y throughput: no disponibles; al ser un modelo de 4B, se espera una velocidad alta en GPU de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-GLB-3D-Coder (este) | ~4,2 B | No disponible | Apache 2.0 | GGUF, safetensors | Especializado en Three.js, GLB y Godot; multimodal |
| Qwen2.5-Coder-3B | ~3 B | 32K (tipico en la familia) | Apache 2.0 | GGUF, safetensors | Código general, sin especialización 3D |
| Qwen2.5-Coder-7B | ~7 B | 32K (tipico en la familia) | Apache 2.0 | GGUF, safetensors | Mayor calidad de código general, más pesado |
| DeepSeek-Coder-V2-Lite | ~16 B (MoE, 2,4 B activos) | 128K | DeepSeek License | safetensors, GGUF | Código general, contexto muy largo |

La comparación con modelos de la familia Qwen2.5-Coder es aproximada: no se dispone de datos de benchmarks del modelo evaluado que permitan contrastar calidad. La ventaja diferencial del modelo evaluado es su especialización en 3D y su naturaleza multimodal; su desventaja es la falta de documentación sobre contexto y rendimiento.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- No se publican datos de benchmarks, por lo que la calidad real del código generado no puede verificarse a priori.
- Riesgo de alucinación en APIs específicas de Three.js o Godot, especialmente en versiones recientes de las librerías.
- Las cuantizaciones Q2_K y Q3 degradan notablemente la calidad; se recomienda Q4_K_M o superior para uso en producción.
- No hay cuantizaciones imatrix (weighted) disponibles, lo que limita la calidad máxima alcanzable en tamaños pequeños.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base (ccore/Qwen3.5-4B-GLB-3D-Coder) y de la familia Qwen3.5 por si hubiera restricciones adicionales.
- El tamaño del repo (39,9 GB) incluye todas las cuantizaciones; descargar solo el archivo necesario.
- La fecha de creación (noviembre de 2026) es posterior a la fecha actual de muchos entornos, lo que puede indicar metadata inconsistente o un modelo de reciente publicación.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-4B-GLB-3D-Coder-GGUF
- Modelo base: https://huggingface.co/ccore/Qwen3.5-4B-GLB-3D-Coder
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.5-4B-GLB-3D-Coder-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Web del patrocinador (nethype GmbH): https://www.nethype.de/
