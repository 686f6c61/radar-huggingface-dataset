# shibamspeed/starvector-8b-im2svg-GGUF

## Resumen

StarVector 8B im2svg en formato GGUF es una versión cuantizada del modelo multimodal `starvector/starvector-8b-im2svg`, desarrollado originalmente por el equipo de StarVector y publicado bajo licencia Apache-2.0. Su tarea es la vectorización generativa: recibe una imagen ráster (PNG, JPEG) y produce código SVG editable como salida textual, en lugar de limitarse a trazar contornos. La cuantización la firma el usuario `shibamspeed` y está pensada para su uso dentro de ComfyUI mediante el nodo personalizado ComfyUI-StarVector-GGUF.

El modelo base cuenta con 7.507.080.192 parámetros (aproximadamente 7,5 mil millones) y combina un codificador visual, un proyector multimodal y un decodificador de lenguaje que genera el SVG token a token. Esta versión GGUF empaqueta los tres componentes junto con la configuración y el tokenizador en un único archivo, lo que simplifica el despliegue en entornos de inferencia local sin necesidad de cargar el checkpoint original en safetensors.

La relevancia actual del modelo radica en que permite generar SVG semánticamente estructurados (con elementos `<path>`, `<circle>`, `<rect>`, etc.) a partir de bocetos, logotipos o diagramas, algo útil para pipelines de diseño y automatización gráfica. Al estar cuantizado en Q4_0, Q5_0 y Q8_0, reduce el requisito de VRAM frente al checkpoint BF16 y facilita su integración en flujos de ComfyUI orientados a producción gráfica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multimodal imagen-a-texto (codificador visual + proyector + decodificador de lenguaje) |
| Parámetros totales | 7.507.080.192 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_0, Q5_0, Q8_0 (GGUF) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base StarVector 8B im2svg es un sistema multimodal compuesto por un codificador de visión que procesa la imagen de entrada, un proyector que alinea las representaciones visuales con el espacio del decodificador y un decodificador autorregresivo que emite la secuencia de tokens correspondiente al SVG. La salida es texto estructurado en formato SVG, lo que permite que el resultado sea editable y escalable. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación de esta variante GGUF reside en el proceso de cuantización: los archivos Q4_0 y Q5_0 mantienen el codificador visual, el proyector y los embeddings de tokens en Q8_0, mientras que el decodificador se cuantiza al nivel indicado. Según la model card, con esta configuración el decodificador coincide con el checkpoint BF16 en el 99-100 % de los tokens top-1 a lo largo de miles de tokens SVG, lo que indica una pérdida de calidad muy baja en la generación. Los archivos se generan con la herramienta `tools/starvector_safetensors_to_gguf.py` del repositorio ComfyUI-StarVector-GGUF.

## Capacidades

- Conversión de imágenes ráster a SVG con estructura semántica (paths, formas geométricas y atributos).
- Generación autorregresiva de código SVG token a token, lo que permite SVGs editables y escalables.
- Procesamiento multimodal: entrada de imagen y salida de texto.
- Integración nativa con ComfyUI mediante los nodos Load StarVector GGUF, Load Image, Image to SVG y Save SVG.
- Soporte de cuantizaciones Q4_0, Q5_0 y Q8_0 para distintos equilibrios entre VRAM y fidelidad.
- Capacidad multilingüe limitada al inglés según la model card.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Vectorización de logotipos y marcas: a partir de un PNG o JPEG de un logotipo, el modelo genera un SVG editable que puede retocarse en Illustrator o Inkscape, evitando el trazado automático tradicional que produce nodos redundantes.
- Automatización de assets para diseño web: en un pipeline de ComfyUI se puede convertir un lote de iconos ráster a SVG para usarlos como sprites vectoriales responsivos, aprovechando la salida textual estructurada.
- Reconstrucción de diagramas y esquemas: imágenes de diagramas de flujo o esquemas técnicos se transforman en SVG con formas geométricas reconocibles, útiles para documentación técnica versionada.
- Preparación de material para impresión a gran escala: al obtener SVG en lugar de ráster, el resultado se puede escalar sin pérdida de calidad para cartelería o señalética.
- Integración en flujos de ComfyUI para artistas gráficos: combinando Load Image, Image to SVG y Save SVG se automatiza la conversión dentro de un grafo de nodos existente, sin salir del entorno.
- Prototipado rápido de ilustraciones vectoriales: bocetos a mano alzada se convierten en SVG base que el diseñador refina después, reduciendo el tiempo de vectorización manual.
- Generación de datasets SVG: la salida textual del modelo puede emplearse para construir corpus de pares imagen-SVG destinados a entrenar o evaluar otros sistemas de vectorización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la coincidencia de tokens top-1 frente al checkpoint BF16 (99-100 % en Q4_0 y Q5_0 con codificador, proyector y embeddings en Q8_0), que es una métrica de fidelidad de cuantización, no un benchmark de calidad de vectorización.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5 GB en Q4_0, 5,4 GB en Q5_0 y 8 GB en Q8_0, según los tamaños de archivo indicados en la model card.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM para Q8_0; para Q4_0 y Q5_0 basta con 6 GB, lo que incluye RTX 3060, RTX 4060, RTX 4070 y superiores.
- Cabe en GPU de consumo: sí, en modelos con 6-8 GB de VRAM o más, en función de la cuantización elegida.
- Opciones de despliegue: ComfyUI con el nodo ComfyUI-StarVector-GGUF; el formato GGUF es compatible con el ecosistema llama.cpp, aunque la model card solo documenta el flujo de ComfyUI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shibamspeed/starvector-8b-im2svg-GGUF | 7.507.080.192 | No disponible | GGUF (Q4_0, Q5_0, Q8_0) | Apache-2.0 | Hugging Face |
| starvector/starvector-8b-im2svg (base) | 7.507.080.192 | No disponible | Safetensors (BF16) | Apache-2.0 | Hugging Face |
| Otros modelos de vectorización | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos alternativos de vectorización imagen-a-SVG con los que establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El modelo está entrenado y orientado principalmente al inglés; la salida SVG puede contener metadatos o texto en ese idioma.
- Riesgo de alucinación visual: en imágenes complejas o con ruido, el modelo puede generar formas que no corresponden fielmente a la entrada.
- No se documentan sesgos específicos, pero al ser un modelo entrenado sobre datos de imágenes y SVG, puede heredar sesgos de representación de esos corpus.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datasets de entrenamiento originales.
- El uso está documentado exclusivamente para ComfyUI con el nodo ComfyUI-StarVector-GGUF; otros backends GGUF no están validados en la model card.
- La fidelidad de la cuantización se ha medido en tokens top-1, no en calidad perceptual del SVG resultante; puede haber degradación en detalles finos no capturada por esa métrica.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.

## Enlaces

- [Hugging Face: shibamspeed/starvector-8b-im2svg-GGUF](https://huggingface.co/shibamspeed/starvector-8b-im2svg-GGUF)
- [Modelo base: starvector/starvector-8b-im2svg](https://huggingface.co/starvector/starvector-8b-im2svg)
- [Repositorio ComfyUI-StarVector-GGUF](https://github.com/StefanoBalocco/ComfyUI-StarVector-GGUF)
- [Instrucciones de instalación de ComfyUI-StarVector-GGUF](https://github.com/StefanoBalocco/ComfyUI-StarVector-GGUF#install)
