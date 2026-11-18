# Lightricks/LTX-2.5-22b-IC-LoRA-Pixel-Spatial-Upscaler

## Resumen

LTX-2.5-22b-IC-LoRA-Pixel-Spatial-Upscaler es un adaptador LoRA de tipo IC-LoRA (In-Context LoRA) publicado por Lightricks sobre el modelo base de difusión de vídeo LTX-2.5, de 22.000 millones de parámetros. Su función concreta es el reescalado espacial de vídeo (superresolución y upscaling de resolución espacial) dentro del pipeline video-to-video de LTX-2.5: recibe un vídeo de baja resolución y genera una versión de mayor resolución manteniendo coherencia temporal entre fotogramas, algo crítico en vídeo generativo donde el upscaling fotograma a fotograma produce parpadeo y artefactos.

El adaptador no es un modelo autónomo: requiere el checkpoint base Lightricks/LTX-2.5 y se distribuye como archivo único de difusión (diffusion-single-file) con un peso de repositorio de aproximadamente 0,3 GB, coherente con un LoRA de rango bajo sobre un transformer de difusión de gran tamaño. La relevancia práctica está en que permite elevar la resolución de salidas de vídeo generado sin reentrenar el modelo base ni ejecutar un pipeline de superresolución independiente, integrándose en el mismo grafo de difusión.

El acceso está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos. La licencia es la LTX-2.x Community License, que no es una licencia de código abierto estándar y establece condiciones específicas para uso comercial, por lo que conviene revisarla antes de integrarlo en producción. El repositorio acumula unas 13.500 descargas y 163 likes desde su creación en agosto de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (IC-LoRA) sobre transformer de difusión de vídeo LTX-2.5 |
| Parametros totales | 22.000 millones (modelo base); parámetros del adaptador no disponibles |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene un archivo de difusión único; no se listan variantes GGUF/FP8) |
| Idiomas soportados | ingles (tag `en`); cobertura multilingüe no disponible |
| Licencia | ltx-2.x-community-license (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | diffusion-single-file (archivo único para pipeline de difusión) |

## Arquitectura y entrenamiento

El adaptador se construye sobre LTX-2.5, un modelo de difusión para generación y edición de vídeo con 22.000 millones de parámetros en el checkpoint base. La técnica IC-LoRA (In-Context LoRA) consiste en un adaptador de bajo rango que condiciona al modelo base mediante contexto adicional en lugar de modificar sus pesos principales, lo que permite añadir una tarea nueva —en este caso el upscaling espacial de píxeles— conservando intactas las capacidades originales del transformer de difusión. El resultado es un módulo que se aplica en el pipeline video-to-video del modelo base.

No se dispone de información publicada sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones específicas de decodificación o atención para este adaptador. El tamaño del repositorio (0,3 GB) sugiere un adaptador compacto, pero no se detallan el rango, los módulos objetivo ni la estrategia de fusión.

## Capacidades

- Upscaling espacial de vídeo: aumenta la resolución espacial de un vídeo de entrada dentro del pipeline video-to-video de LTX-2.5.
- Superresolución con coherencia temporal: al operar dentro del modelo de difusión de vídeo, mantiene consistencia entre fotogramas en lugar de tratar cada frame de forma aislada.
- Integración como IC-LoRA: se combina con el checkpoint base LTX-2.5 sin sustituirlo, permitiendo encadenar otras LoRAs del ecosistema (movimiento, cinemagraph, etc.).
- Condicionamiento por contexto: la naturaleza In-Context permite guiar la generación con la señal de vídeo de entrada.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, audio, visión general ni modo thinking; es un adaptador especializado en una única tarea de vídeo.

## Casos de uso

- Remasterización de vídeo generado: tomar salidas de LTX-2.5 a resolución baja o media y elevarlas a 1080p o superior dentro del mismo grafo de difusión, evitando un pipeline de superresolución separado y el consiguiente parpadeo temporal.
- Previsualización rápida y entrega final: generar borradores a baja resolución (más rápidos y baratos en cómputo) y aplicar el upscaler solo a los clips aprobados, reduciendo el coste total de GPU por proyecto.
- Producción de contenido para redes sociales y publicidad: escalar clips cortos generados por IA a la resolución exigida por plataformas (vertical u horizontal) manteniendo detalle en texto y bordes.
- Postproducción de material de archivo: aumentar la resolución espacial de metraje antiguo o de baja calidad antes de insertarlo en una timeline junto a material nativo en alta definición.
- Integración en herramientas creativas de Lightricks: el adaptador encaja en flujos tipo LTX Studio donde el usuario genera, edita y exporta vídeo en una sola interfaz, usando el upscaler como paso final del pipeline.
- Prototipado de investigación en vídeo generativo: servir de base para estudiar superresolución condicionada por difusión y comparar IC-LoRA frente a upscalers discriminativos clásicos (ESRGAN, Real-ESRGAN) en métricas temporales.
- Renderizado por etapas en estudios pequeños: separar la fase de generación (menor resolución) de la de escalado permite distribuir el trabajo entre distintas GPUs y ajustar el presupuesto de VRAM por etapa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Al requerir el checkpoint base de 22.000 millones de parámetros, la inferencia en precisión completa (BF16) exige del orden de 44 GB solo para pesos, más memoria para activaciones y latents de vídeo, por lo que se necesita hardware de clase数据中心 o cuantización agresiva.
- GPU recomendadas: A100 80 GB, H100 80 GB o múltiples GPU de 24-48 GB con paralelización; no se documentan configuraciones validadas por el autor.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en BF16 sin técnicas de offloading o cuantización; no se confirma soporte en GPUs de 8-16 GB.
- Opciones de despliegue: el repo es diffusion-single-file, por lo que se integra con runners de difusión compatibles con LTX-2.5 (Diffusers y el ecosistema de Lightricks); no se listan instrucciones para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de difusión de vídeo.
- Latencia y throughput: no disponibles. Dependen fuertemente de la resolución de entrada y salida, la longitud del clip y el número de pasos de muestreo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.5-22b-IC-LoRA-Pixel-Spatial-Upscaler | LoRA de upscaling sobre difusión de vídeo | 22B (base) | no disponible | LTX-2.x Community License | Gated en Hugging Face |
| LTX-2.5 (base) | Difusión de vídeo | 22B | no disponible | LTX-2.x Community License | Gated en Hugging Face |
| Otras LoRAs LTX-2.5 (Slow-Motion-Control, Cinemagraph) | LoRA de control sobre el mismo base | 22B (base) | no disponible | LTX-2.x Community License | Hugging Face |
| Real-ESRGAN | Superresolución de imagen (no vídeo) | no disponible | por imagen | BSD-3-Clause | Abierto |

La comparación directa con upscalers de imagen clásicos no es equivalente: este adaptador opera dentro de un modelo de difusión de vídeo y preserva coherencia temporal, mientras que los upscalers por imagen requieren post-procesado temporal adicional. No se dispone de métricas comparativas publicadas (PSNR, SSIM, LPIPS, FVD) para este adaptador.

## Limitaciones y advertencias

- Dependencia del modelo base: no funciona de forma autónoma; requiere descargar y cargar Lightricks/LTX-2.5, con el coste de VRAM y almacenamiento asociado.
- Acceso restringido: la descarga exige aceptar la licencia en Hugging Face; la automatización en CI/CD requiere gestionar tokens de acceso.
- Licencia no open source: la LTX-2.x Community License impone condiciones específicas para uso comercial; es imprescindible revisar umbrales de facturación, atribución y restricciones de redistribución antes de desplegarlo.
- Riesgo de artefactos: como todo upscaler generativo, puede inventar detalle inexistente (alucinación visual), especialmente en texturas finas, texto pequeño y caras; conviene validar visualmente las salidas.
- Sesgos: no se documentan sesgos específicos, pero hereda los del modelo base en cuanto a representación demográfica y estilos visuales.
- Idiomas: el tag del repositorio indica únicamente inglés; el comportamiento con texto en pantalla en otros idiomas no está documentado.
- Ausencia de métricas: no hay benchmarks publicados que permitan estimar la ganancia real de calidad frente a alternativas, lo que dificulta una decisión de adopción basada en datos.
- Documentación escasa: no se detallan parámetros de inferencia recomendados (pasos, guidance, escala de fuerza de la LoRA), lo que obliga a experimentar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Pixel-Spatial-Upscaler
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Organización Lightricks en Hugging Face: https://huggingface.co/Lightricks
- Sitio web de Lightricks: https://www.lightricks.com/
- Sobre Lightricks: https://www.lightricks.com/about
- GitHub de Lightricks: https://github.com/Lightricks
- Wikipedia (Lightricks): https://en.m.wikipedia.org/wiki/Lightricks
