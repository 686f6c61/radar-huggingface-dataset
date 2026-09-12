# matrixportalx/Realism_By_Stable_Yogi_V9

## Resumen

Realism_By_Stable_Yogi_V9 es una conversión del modelo de difusión Stable Diffusion 1.5 (SD 1.5) al runtime Qualcomm QNN (versión qnn2.28), empaquetada para ejecutarse sobre la NPU Hexagon de los SoC Snapdragon. El objetivo no es entrenar un modelo nuevo, sino adaptar pesos ya existentes de SD 1.5 —con un ajuste de realismo denominado "Stable Yogi V9"— para que la inferencia de imagen a partir de texto ocurra íntegramente en el dispositivo, sin conexión a internet ni servidores externos. El autor del repositorio es el usuario matrixportalx, que también mantiene el repositorio de conversión Sd-1.5-Converting-to-Qualcomm-QNN-Model.

La distribución está pensada para la aplicación móvil Ruya / Local Dream: el usuario descarga el fichero `Realism_By_Stable_Yogi_V9_qnn2.28_8gen2.zip` y lo importa desde el menú Settings → Import Custom Model. La variante publicada corresponde al tier `8gen2` con HTP v73 y activaciones de 16 bits, compatible con Snapdragon 8 Gen 2, 8s Gen 3, 7+ Gen 2 y 7 Gen 3. El UNet se ejecuta como contexto binario QNN sobre la NPU, mientras que el text encoder y el VAE se delegan a MNN en CPU/GPU.

Resoluciones soportadas: 512x512, 768x512 y 512x768. El repositorio ocupa 1,0 GB. En el momento de la consulta acumulaba 0 descargas y 0 likes, por lo que no existe validación comunitaria ni resultados de benchmarks publicados. La relevancia actual del modelo es de nicho: sirve como referencia práctica de cómo portar un checkpoints de SD 1.5 a NPU Qualcomm y como base de generación de imágenes offline en Android de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente (SD 1.5): UNet sobre QNN, text encoder CLIP y VAE sobre MNN |
| Parametros totales | no disponible en la model card (corresponde al pipeline estandar de SD 1.5) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el text encoder de SD 1.5 limita el prompt a 77 tokens |
| Tipos de cuantizacion | no disponible; el runtime usa activaciones de 16 bits (HTP v73) |
| Idiomas soportados | no disponible (los prompts de SD 1.5 funcionan principalmente en ingles) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | contexto binario QNN (UNet) + MNN (text encoder y VAE), empaquetado en `Realism_By_Stable_Yogi_V9_qnn2.28_8gen2.zip` |

## Arquitectura y entrenamiento

La model card no documenta ningún proceso de entrenamiento propio: se trata de un artefacto de conversión y empaquetado. La base declarada es SD 1.5, un modelo de difusión latente compuesto por un UNet, un text encoder CLIP y un VAE. El pipeline de conversión transforma el UNet en un contexto binario ejecutable por el runtime Qualcomm AI Engine Direct (QAIRT) qnn2.28, con el tier `8gen2` orientado al HTP v73 y activaciones de 16 bits; el text encoder y el VAE quedan fuera de la NPU y se sirven mediante MNN en CPU/GPU. Este reparto es habitual en despliegues móviles, porque la NPU aporta la mayor parte del coste computacional en el UNet y libera a la CPU de las capas de atención y convolución más pesadas.

No se especifica el dataset de ajuste del supuesto fine-tune "Stable Yogi V9", ni el número de tokens o imágenes empleados, ni si hubo etapas de RLHF, DPO o fine-tuning por preferencias. Tampoco se detalla si se aplicó quantización adicional de pesos más allá del formato de 16 bits del runtime, ni el método exacto de exportación (aunque el autor enlaza su repositorio de conversión en GitHub). En consecuencia, cualquier afirmación sobre datos de entrenamiento, composición del dataset o innovaciones técnicas del ajuste debe considerarse no disponible.

## Capacidades

- Generación de imágenes realistas a partir de prompts de texto (text-to-image), con foco declarado en el realismo fotográfico por el ajuste "Stable Yogi V9".
- Inferencia completamente local en la NPU del dispositivo, sin llamadas a servicios en la nube.
- Generación en tres relaciones de aspecto: 512x512, 768x512 y 512x768.
- Ejecución integrada en la aplicación Ruya / Local Dream mediante importación de modelo personalizado.
- Aceleración por hardware: UNet sobre Hexagon NPU (HTP v73) y text encoder/VAE sobre MNN.
- Compatibilidad declarada con Snapdragon 8 Gen 2, 8s Gen 3, 7+ Gen 2 y 7 Gen 3.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de difusión de una sola pasada, sin interfaz de herramientas.
- No hay soporte declarado de visión, audio, vídeo, thinking mode ni edición de imagen por instrucciones.
- Soporte multilingüe: no disponible; los prompts de SD 1.5 rinden mejor en inglés.

## Casos de uso

- Generación de imágenes offline en Android: una aplicación móvil puede ofrecer text-to-image sin conexión usando el zip importado en Ruya / Local Dream, útil en entornos sin red o con requisitos de privacidad estrictos.
- Prototipado de producto móvil: equipos que evalúan si una NPU Snapdragon es suficiente para SD 1.5 pueden usar este modelo como referencia funcional antes de invertir en su propio pipeline de conversión QNN.
- Aplicaciones de privacidad sensible: al ejecutarse el UNet en la NPU local y no requerir subida de prompts ni imágenes a un servidor, encaja en escenarios donde la política interna prohíbe enviar contenido a APIs externas.
- Referencia para pipelines de conversión: sirve como ejemplo verificable del flujo SD 1.5 → QNN qnn2.28 descrito en el repositorio de conversión del autor, con reparto UNet/NPU y encoder/VAE/MNN.
- Creación de contenido para redes en movilidad: generación de ilustraciones o imágenes de producto a 512x512 y 512x768 directamente en el teléfono, sin depender de una estación de trabajo con GPU.
- Base para ajustes posteriores: al derivar de SD 1.5, es compatible con el ecosistema de LoRAs y embeddings de esa familia, siempre que se rehaga la conversión a QNN tras el ajuste.
- Demostraciones técnicas y docencia: permite explicar en clase o en charlas cómo se distribuye un modelo de difusión entre NPU, CPU y GPU en un SoC móvil.
- Evaluación comparativa de realismo en dispositivos: útil para contrastar la calidad del ajuste "Stable Yogi V9" frente al SD 1.5 original en el mismo hardware, si bien no hay métricas publicadas al respecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, MMLU, HumanEval ni ninguna otra métrica, y el repositorio registra 0 descargas y 0 likes, por lo que tampoco existen evaluaciones de terceros. Tampoco se publican datos de latencia, iteraciones por segundo ni consumo energético sobre los SoC compatibles.

## Requisitos de hardware

- No se trata de un modelo para GPU de escritorio: el artefacto está empaquetado para la NPU Hexagon de Qualcomm.
- SoC compatibles declarados (tier `8gen2`, HTP v73): Snapdragon 8 Gen 2, Snapdragon 8s Gen 3, Snapdragon 7+ Gen 2 y Snapdragon 7 Gen 3.
- VRAM estimada: no aplicable; el modelo no se ejecuta en GPUs dedicadas tipo RTX, A100 o H100.
- Compatibilidad con GPU de consumo: no disponible. No se documenta ningún formato GGUF, safetensors ni ONNX que permita ejecutarlo en una RTX 4090 u otra GPU de escritorio.
- Tamaño de la distribución: 1,0 GB de repositorio, con un fichero zip de importación para el dispositivo.
- Opciones de despliegue: aplicación Ruya / Local Dream (importación de modelo personalizado) sobre runtime Qualcomm QNN qnn2.28; text encoder y VAE vía MNN.
- No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, que además no aplican a un modelo de difusión de imagen.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Resoluciones | Formato y runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Realism_By_Stable_Yogi_V9 | SD 1.5 convertido a NPU Qualcomm | 512x512, 768x512, 512x768 | Contexto QNN (UNet) + MNN (encoder/VAE), qnn2.28, tier 8gen2 | CreativeML Open RAIL-M | HuggingFace, 0 descargas y 0 likes |
| SD 1.5 original (Runway / Stability AI) | Difusion latente base | 512x512 | safetensors / diffusers, GPU o CPU | CreativeML Open RAIL-M | Ampliamente distribuido |
| Alternativas de SD 1.5 para movil (conversiones a ONNX Runtime, Core ML u otras) | Difusion latente convertida | variable | ONNX / Core ML / otros runtimes moviles | depende del publicador | no disponible en la informacion proporcionada |
| Modelos de difusion de mayor tamano (por ejemplo, familia SDXL) | Difusion latente de mayor escala | desde 1024x1024 | safetensors / diffusers | licencias propias de cada checkpoint | no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas opciones, ni de métricas de calidad para el ajuste "Stable Yogi V9" frente al SD 1.5 original.

## Limitaciones y advertencias

- Ausencia total de validación: 0 descargas y 0 likes, sin benchmarks ni evaluaciones de terceros; no hay evidencia pública de la calidad del resultado.
- Opacidad del ajuste: la model card no documenta el dataset, el número de pasos ni el método de entrenamiento del fine-tune "Stable Yogi V9", lo que impide auditar sesgos o procedencia de los datos.
- Herencia de sesgos de SD 1.5: al derivar de ese modelo base, arrastra sus sesgos conocidos en representación de personas, profesiones, etnias y culturas.
- Riesgo de artefactos visuales: deformaciones anatómicas (manos, rostros), texto ilegible y composiciones incoherentes son fallos típicos en la familia SD 1.5, especialmente en prompts complejos.
- Ventana de prompt corta: el text encoder de SD 1.5 limita el prompt a 77 tokens, lo que restringe instrucciones largas o muy detalladas.
- Idioma: no hay soporte multilingüe declarado; el rendimiento con prompts en castellano no está garantizado ni documentado.
- Dependencia de hardware concreta: el tier `8gen2` con HTP v73 no es portable a otros SoC Snapdragon con versiones anteriores de Hexagon; usar el artefacto en un dispositivo distinto puede fallar o degradar el rendimiento.
- Acoplamiento al runtime: requiere qnn2.28 y la aplicación Ruya / Local Dream; no se ofrecen pesos en safetensors, GGUF ni ONNX para otros entornos.
- Restricciones de licencia: CreativeML Open RAIL-M permite uso comercial, pero impone las prohibiciones de uso del anexo (contenido ilegal, dañino, desinformación, suplantación, etc.) y exige redistribuir la licencia junto con el modelo y sus derivados. Conviene revisar el texto completo antes de integrarlo en un producto.
- Documentación en turco: la model card está redactada en turco, lo que puede dificultar la integración a equipos que no lo lean.
- Sin garantías de mantenimiento: no se detalla versionado, soporte ni actualizaciones del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matrixportalx/Realism_By_Stable_Yogi_V9
- Repositorio de conversión del autor (SD 1.5 a Qualcomm QNN): https://github.com/matrixportalx/Sd-1.5-Converting-to-Qualcomm-QNN-Model
- Repositorio de la aplicación Ruya / Local Dream: no disponible en la informacion proporcionada
- Paper o documentación técnica del ajuste "Stable Yogi V9": no disponible
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; únicamente aparecieron páginas de soporte de Microsoft sin relación con el contenido de la ficha.
