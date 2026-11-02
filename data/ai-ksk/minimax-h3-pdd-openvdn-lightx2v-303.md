# AI-KSK/minimax-h3-pdd-openvdn-lightx2v-303

## Resumen

El repositorio `AI-KSK/minimax-h3-pdd-openvdn-lightx2v-303` no contiene un modelo de lenguaje en el sentido convencional, sino un paquete estático de exportaciones de flujos de trabajo (workflows) de ComfyUI para el modelo de generación de vídeo MiniMax H3. El autor, AI-KSK, distribuye seis exportaciones que combinan tres rutas de aceleración distintas —PDD, OpenVDN y LightX2V— cada una con variantes etiquetadas como referencia y como endpoint. El paquete incluye los JSON de los flujos, imágenes de portada y referencias a los pesos safetensors necesarios para ejecutarlos.

La relevancia del repositorio es acotada: no se trata de un modelo entrenado ni de una reproducción de benchmarks, sino de material de configuración que documenta cómo encadenar los nodos de ComfyUI para tareas de generación de vídeo con audio nativo a partir de una imagen de referencia (Ref2VA) o de primer y último fotograma (FL2VA). El propio autor advierte explícitamente que las etiquetas "8 pasos" o "DMD8" identifican rutas de muestreo y no rendimiento medido en NFE ni en tiempo de reloj.

El tamaño del repositorio es de 0,0 GB, sin descargas ni likes, y no declara licencia, idiomas ni pipeline. La model card es fundamentalmente un inventario técnico de assets y una descripción de la topología de cada grafo, con advertencias sobre discrepancias entre títulos, widgets y tareas seleccionadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible como modelo único; el paquete orquesta componentes de MiniMax H3 (difusión vídeo+audio) con encoder Qwen3-VL-32B |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no se declara MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | int8 (VAE de vídeo con `convrot`), fp32 (VAE de audio), nvfp4 + AWQ (encoder Qwen3-VL-32B) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (referenciados, no incluidos en el repo de 0,0 GB) |

## Arquitectura y entrenamiento

El paquete no entrena ningún modelo. Describe tres rutas de aceleración sobre MiniMax H3, un sistema de generación de vídeo con audio nativo: PDD (variantes `MiniMax-H3-Ref2VA-Acc-8Step_comfyui_pdd-T8` y `MiniMax-H3-FL2VA-Acc-8Step_comfyui_pdd-T8`), OpenVDN (`vdn-minimax-h3` con `stage_dmd_8nfe`) y LightX2V (mencionada en el título pero sin detalle en el fragmento de model card disponible). Cada ruta incluye un setup que recibe el modelo base y el latente AV y proporciona modelo, sampler y sigmas; en todas ellas `strength` es 1 y no se serializa un array numérico de sigmas.

Los assets seleccionados incluyen un VAE de vídeo cuantizado a int8 con rotación de convoluciones, un VAE de audio en fp32 y un encoder multimodal Qwen3-VL-32B en nvfp4 con AWQ. La decodificación se realiza mediante un nodo AVDecode que alimenta un nodo VHS para fotogramas y audio generado, con salida a 24 fps, H.264, CRF 19, yuv420p y `trim_to_audio=false`. Las resoluciones seleccionadas son 736×416 o 896×512 según la ruta, con longitud de 124 fotogramas, lo que a 24 fps equivale nominalmente a unos 5,167 segundos (el autor insiste en que no es una duración medida).

## Capacidades

- Generación de vídeo a partir de una imagen de referencia (Ref2VA) con audio nativo generado.
- Generación de vídeo con control de primer y último fotograma (FL2VA), sujeta a revisión por discrepancias entre la base seleccionada y la tarea del conditioner.
- Salida de audio generado decodificado junto al vídeo; no hay entradas de audio fuente ni uso de `mux_audio`.
- Control de ruido configurable (aleatorio en PDD, semilla fija 9527 en OpenVDN).
- Resoluciones de 736×416 y 896×512, 124 fotogramas, 24 fps.
- No se documentan tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.

## Casos de uso

- Prototipado de vídeo corto con audio: usar la ruta PDD Ref2VA para generar clips de ~5 s a 736×416 a partir de una imagen, adecuado para pruebas rápidas de concepto en ComfyUI.
- Interpolación entre fotogramas clave: la ruta FL2VA permite definir primer y último fotograma, útil para transiciones controladas, aunque el autor advierte revisar la discrepancia de tarea antes de prometer control de endpoints.
- Evaluación comparativa de rutas de aceleración: los seis exports permiten comparar PDD frente a OpenVDN DMD8 sobre el mismo prompt y resolución, con la salvedad de que las etiquetas no son benchmarks medidos.
- Generación de audio sincronizado en clips cortos: el pipeline AVDecode produce pistas de audio generadas que se guardan junto al vídeo, útil para maquetas con sonido diegético.
- Integración en pipelines de ComfyUI existentes: los JSON pueden importarse directamente y sustituir los assets por los pesos propios del usuario.
- Documentación de referencia para ingenieros que necesiten entender el cableado de nodos (AVDecode, VHS, CreateVideo, SaveVideo) en flujos MiniMax H3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que las etiquetas "8 pasos" y "DMD8" no son evaluaciones observadas ni mediciones de NFE o tiempo de reloj.

## Requisitos de hardware

- VRAM estimada: no disponible. El paquete referencia un encoder Qwen3-VL-32B en nvfp4+AWQ, un VAE de vídeo int8 y un VAE de audio fp32, lo que sugiere requisitos elevados, pero no se aportan cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI (los workflows son JSON de ComfyUI); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor rechaza explícitamente presentar los "8 pasos" como medida de rendimiento.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- El repositorio no contiene pesos (0,0 GB); solo workflows, portadas y referencias a assets externos.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido.
- Discrepancias documentadas entre títulos, widgets y tareas: por ejemplo, títulos "960×544/39 frames" frente a widgets "896×512/124", o base FL2VA con tarea Ref2VA seleccionada.
- La validación de hashes JSON no equivale a verificación de hashes de pesos (`verify_hashes=false`).
- Riesgo de sobreinterpretar las etiquetas de aceleración como rendimiento medido; el autor lo niega expresamente.
- El audio generado no está verificado como audible en la model card; las descripciones de paisaje sonoro del prompt son instrucciones, no prueba.
- No hay información sobre sesgos, alucinación, cobertura idiomática ni límites de contexto.
- Los flujos incluyen nodos con prefijo AnimateDiff que el autor aclara que no son evidencia de arquitectura.

## Enlaces

- [HuggingFace: AI-KSK/minimax-h3-pdd-openvdn-lightx2v-303](https://huggingface.co/AI-KSK/minimax-h3-pdd-openvdn-lightx2v-303)
- Workflows referenciados en la model card: `workflows/MiniMax H3｜PDD 8步｜参考生视频.json`, `workflows/MiniMax H3｜PDD 8步｜首尾帧视频.json`, `workflows/MiniMax H3｜OpenVDN DMD8｜参考生视频.json`, `workflows/MiniMax H3｜OpenVDN DMD8｜首尾帧视频.json`
- Portadas referenciadas: `covers/MiniMax H3｜PDD 8步｜参考生视频.webp`, `covers/MiniMax H3｜PDD 8步｜首尾帧视频.webp`, `covers/MiniMax H3｜OpenVDN DMD8｜参考生视频.webp`, `covers/MiniMax H3｜OpenVDN DMD8｜首尾帧视频.webp`
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
