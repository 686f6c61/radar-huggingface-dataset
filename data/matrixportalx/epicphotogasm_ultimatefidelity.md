# matrixportalx/epiCPhotoGasm_UltimateFidelity

## Resumen

epiCPhotoGasm_UltimateFidelity es una conversión del modelo de difusión latente Stable Diffusion 1.5 a formato Qualcomm QNN (runtime qnn2.28), publicada por el usuario matrixportalx. No es un modelo entrenado desde cero ni un ajuste fino: es una redistribución optimizada del UNet de SD 1.5 como contexto binario QNN para ejecutarse en la NPU Hexagon (HTP v73) de determinados SoC Snapdragon, con el codificador de texto y el VAE ejecutándose en CPU/GPU mediante MNN.

El objetivo es permitir generación de imágenes texto-a-imagen totalmente local en teléfonos Android, integrándose en la aplicación Ruya / Local Dream mediante la opción de importación de modelos personalizados. Resuelve, por tanto, el problema del coste energético y de latencia de ejecutar difusión en CPU móvil, delegando el bucle de denoising del UNet a la NPU.

El repositorio ocupa 1,0 GB y solo declara compatibilidad con el tier `8gen2` (HTP v73), lo que cubre Snapdragon 8 Gen 2, 8s Gen 3, 7+ Gen 2 y 7 Gen 3. No incluye pesos en safetensors ni GGUF, sino artefactos específicos de QNN/MNN, y no se han publicado benchmarks, descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente (U-Net + VAE) con codificador de texto CLIP ViT-L/14; base Stable Diffusion 1.5 |
| Parametros totales | ~1.070 M en la arquitectura base SD 1.5 (~860 M U-Net, ~123 M codificador de texto CLIP, ~84 M VAE) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de LLM; el codificador de texto CLIP de SD 1.5 acepta prompts de hasta 77 tokens |
| Tipos de cuantizacion | Activaciones de 16 bits en HTP v73 segun la model card; cuantizacion de pesos no especificada (no disponible) |
| Idiomas soportados | No disponible (la model card y los tags no lo declaran) |
| Licencia | CreativeML Open RAIL-M |
| Formato de pesos | U-Net como contexto binario QNN; text_encoder y VAE en formato MNN; distribuido como ZIP (`epiCPhotoGasm_UltimateFidelity_qnn2.28_8gen2.zip`) |
| Runtime objetivo | qnn2.28, tier `8gen2`, HTP v73 |
| Resoluciones soportadas | 512x512, 768x512, 512x768, 768x768 |
| Tamano del repositorio | 1,0 GB |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Stable Diffusion 1.5: un autoencoder variacional que proyecta la imagen a un espacio latente comprimido, un U-Net que realiza el proceso de denoising iterativo en ese espacio latente y un codificador de texto CLIP ViT-L/14 que condiciona la generación mediante embeddings de prompt. La innovación de esta publicación no está en el entrenamiento, sino en el despliegue: el U-Net se ha exportado como contexto binario QNN para que el runtime qnn2.28 lo ejecute íntegramente en la NPU Hexagon, mientras que el codificador de texto y el decodificador VAE permanecen en MNN sobre CPU/GPU. La model card indica activaciones de 16 bits sobre HTP v73.

No se aporta información sobre el dataset de entrenamiento, el número de tokens de imagen o texto vistos, ni sobre si se aplicaron etapas de ajuste por preferencias humanas (RLHF, DPO) o de destilación. La model card tampoco documenta el procedimiento exacto de calibración de cuantización, el número de pasos de muestreo recomendado ni el scheduler empleado. Todo el pipeline de conversión es reproducible mediante el repositorio del propio autor, enlazado más abajo, que describe el flujo SD 1.5 → Qualcomm QNN.

## Capacidades

- Generación de imágenes texto-a-imagen por difusión latente, con prompts en lenguaje natural.
- Cuatro relaciones de aspecto y resoluciones precompiladas: 512x512, 768x512, 512x768 y 768x768. Las resoluciones no listadas no están garantizadas por la model card.
- Ejecución local íntegra en el dispositivo, sin llamadas a servicios en la nube ni envío de prompts a terceros.
- Aceleración por NPU: el U-Net se ejecuta como contexto QNN en el motor HTP v73; el codificador de texto y el VAE se ejecutan en MNN sobre CPU/GPU.
- Integración con la aplicación Ruya / Local Dream mediante la función «Import Custom Model» de sus ajustes.
- No se documentan capacidades de imagen-a-imagen, inpainting, outpainting, control de pose, LoRA, embeddings textuales adicionales, tool calling ni razonamiento multi-paso. No es un modelo de lenguaje.

## Casos de uso

- Generación de imágenes artísticas sin conexión: el modelo permite crear ilustraciones y conceptos visuales en un teléfono compatible, útil para ilustradores que trabajan en movilidad o en entornos sin conectividad.
- Prototipado rápido de conceptos visuales: gracias a que las cuatro resoluciones están precompiladas, se pueden iterar bocetos a 512x512 antes de producir una versión final a mayor resolución en un equipo de sobremesa.
- Privacidad de datos sensibles: al ejecutarse localmente en la NPU, los prompts y las imágenes no salen del dispositivo, lo que encaja en flujos con requisitos de confidencialidad (por ejemplo, diseño de producto bajo NDA).
- Material de apoyo para docencia y talleres: demostrar el funcionamiento interno de la difusión latente y de la cuantización para NPUs móviles en cursos de IA embebida, usando el repositorio de conversión como material práctico.
- Investigación en eficiencia energética: comparar el consumo por imagen entre la ejecución en NPU Hexagon y una línea base en CPU/GPU móvil para evaluar el impacto real del offload a HTP v73.
- Personalización de la experiencia en aplicaciones Android: desarrolladores que integren Local Dream o una app propia pueden ofrecer un modelo alternativo al predeterminado mediante el mecanismo de importación de ZIP.
- Evaluación de pipelines de conversión: usar este repositorio como referencia para validar una cadena propia SD 1.5 → QNN, verificando que el contexto binario se carga correctamente en el tier `8gen2`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas FID, CLIP score, IS, latencia por imagen, pasos por segundo ni comparaciones cuantitativas con otros modelos. Tampoco se documentan mediciones de consumo energético ni de memoria pico en el dispositivo.

## Requisitos de hardware

- Hardware objetivo: NPU Hexagon con HTP v73. La model card declara compatibilidad con el tier `8gen2`, que corresponde a Snapdragon 8 Gen 2, 8s Gen 3, 7+ Gen 2 y 7 Gen 3.
- No se documentan otros tiers (por ejemplo, versiones anteriores de HTP), por lo que la compatibilidad con SoC distintos de los listados se desconoce.
- VRAM estimada para inferencia: no aplica en el escenario objetivo, ya que el U-Net se ejecuta en la NPU del SoC y no en una GPU de escritorio. Dato no disponible para un hipotético despliegue en GPU.
- GPU de escritorio recomendadas: no disponible. Este repositorio no contiene pesos en safetensors ni GGUF, por lo que no es directamente cargable en vLLM, TGI, llama.cpp, Ollama ni diffusers sin volver a convertir desde los pesos originales de SD 1.5.
- Encaje en GPU de consumo: no aplica al paquete distribuido; el repositorio es un artefacto de despliegue móvil de 1,0 GB.
- Opciones de despliegue: aplicación Ruya / Local Dream en Android con importación del ZIP; alternativamente, el repositorio de conversión del autor para reproducir el pipeline SD 1.5 → QNN.
- Latencia y throughput estimados: no disponible. La model card no publica tiempos por imagen ni número de pasos de muestreo empleados.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion nativa | Contexto de prompt | Licencia | Formato | Despliegue |
|---|---|---|---|---|---|---|
| epiCPhotoGasm_UltimateFidelity | ~1.070 M (arquitectura base SD 1.5) | 512x512, 768x512, 512x768, 768x768 | 77 tokens (CLIP de SD 1.5) | CreativeML Open RAIL-M | Contexto QNN (U-Net) + MNN (text encoder, VAE) | NPU Hexagon HTP v73, app Ruya / Local Dream |
| Stable Diffusion 1.5 (Stability AI, modelo base) | ~1.070 M | 512x512 (nativa) | 77 tokens | CreativeML Open RAIL-M | safetensors / diffusers | GPU de escritorio, CPU, servicios en la nube |
| Otras conversiones QNN de SD 1.5 de terceros | No disponible | No disponible | No disponible | Variable | Contexto QNN | Segun el tier HTP objetivo |

No se dispone de datos comparativos de rendimiento (FID, CLIP score, latencia) entre esta conversión y otras alternativas de la misma categoría. La comparación se limita, por tanto, a parámetros de arquitectura, licencia y formato de despliegue.

## Limitaciones y advertencias

- Ausencia total de métricas: sin benchmarks ni evaluaciones publicadas, no hay evidencia objetiva de que la cuantización QNN preserve la fidelidad de salida del SD 1.5 original. El nombre del modelo sugiere un enfoque en fidelidad fotográfica, pero no lo respalda ningún dato.
- Compatibilidad restringida: solo se declara el tier `8gen2` (HTP v73). En SoC con otras versiones de HTP el modelo podría no cargar o producir resultados incorrectos.
- Resoluciones cerradas: únicamente se garantizan las cuatro resoluciones precompiladas; otras dimensiones pueden fallar o degradar la calidad.
- Repositorio sin validación comunitaria: cero descargas y cero valoraciones en el momento de la consulta, lo que implica ausencia de verificación independiente por parte de terceros.
- Riesgo de alucinación visual: como cualquier modelo de difusión, puede generar anatomías incorrectas, texto ilegible, artefactos en manos y rostros, y composiciones incoherentes con el prompt, especialmente a resoluciones altas.
- Sesgos del modelo base: SD 1.5 arrastra sesgos de representación demográfica, cultural y de género presentes en sus datos de entrenamiento. No se documenta ningún proceso de mitigación adicional en esta conversión.
- Idioma de los prompts: la model card no declara idiomas soportados. El codificador CLIP de SD 1.5 está optimizado para inglés, por lo que los prompts en otros idiomas, incluido el castellano, pueden ofrecer resultados menos fiables.
- Restricciones de licencia: CreativeML Open RAIL-M permite uso comercial, pero impone las restricciones de uso de su Anexo A (prohibición de generar contenido ilegal, dañino, difamatorio, de explotación sexual o desinformación, entre otros). El texto exacto de la licencia prevalece sobre cualquier resumen.
- Contenido potencialmente sensible: el nombre y el origen del modelo apuntan a la generación de imágenes de personas fotorrealistas, lo que exige controles adicionales si se despliega en productos de consumo (filtros de contenido, verificación de edad y trazabilidad de la generación).
- Documentación limitada: la model card está redactada en turco y no detalla la calibración de cuantización, el scheduler, el número de pasos de inferencia ni el consumo de memoria, datos relevantes para una integración en producción.
- Empaquetado no portable: al no distribuirse pesos en safetensors o GGUF, la reutilización fuera del ecosistema QNN/MNN requiere volver a realizar la conversión desde los pesos originales de SD 1.5.

## Enlaces

- HuggingFace: https://huggingface.co/matrixportalx/epiCPhotoGasm_UltimateFidelity
- Repositorio de conversión SD 1.5 → Qualcomm QNN: https://github.com/matrixportalx/Sd-1.5-Converting-to-Qualcomm-QNN-Model
- Aplicación de destino: Ruya / Local Dream (importación de modelo personalizado desde los ajustes de la app); no se ha proporcionado URL en la información disponible.
- Paper o informe técnico: no disponible.
- Demo en línea: no disponible.
- Resultados de la búsqueda web: las referencias recuperadas corresponden a páginas de descarga de Mozilla Firefox y no guardan relación con el modelo; no se han encontrado enlaces adicionales relevantes.
