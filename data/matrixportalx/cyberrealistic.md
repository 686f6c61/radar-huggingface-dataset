# matrixportalx/CyberRealistic

## Resumen

CyberRealistic es un modelo de generacion de imagenes texto-a-imagen derivado de Stable Diffusion 1.5, publicado por el usuario matrixportalx en HuggingFace. No se trata de un modelo entrenado desde cero ni de un ajuste fino documentado: es una conversion del checkpoint SD 1.5 al formato de ejecucion de Qualcomm QNN (qnn2.28) para que el UNet se ejecute sobre la NPU Hexagon de los SoC Snapdragon, mientras que el codificador de texto y el VAE se ejecutan con el runtime MNN sobre CPU/GPU.

El objetivo del artefacto es el despliegue en dispositivo (on-device) dentro de la aplicacion Android Ruya / Local Dream, que permite importar modelos personalizados y generar imagenes sin conexion a internet. La variante publicada esta compilada para el tier `8gen2` con HTP `v73` y activaciones de 16 bits, y cubre las resoluciones 512x512, 768x512, 512x768 y 768x768.

Su relevancia es practica mas que cientifica: ilustra el flujo de conversion de un modelo de difusion de ~1 GB a un binario de contexto QNN ejecutable en telefonos de gama alta, un paso necesario para llevar generacion de imagenes local a hardware movil sin depender de servicios en la nube. La model card no documenta dataset de entrenamiento, proceso de ajuste ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion latente (familia Stable Diffusion 1.5) con codificador de texto CLIP y VAE; UNet compilado como binario de contexto QNN, codificador de texto y VAE en MNN |
| Parametros totales | no disponible en la informacion proporcionada (la arquitectura estandar SD 1.5 ronda los 0,98 mil millones de parametros entre UNet, CLIP y VAE, dato no confirmado por el autor) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; el modelo no procesa contexto de texto. El codificador CLIP de SD 1.5 limita la indicacion a 77 tokens, caracteristica heredada de la arquitectura base, no documentada en la model card |
| Tipos de cuantizacion | runtime qnn2.28 con activaciones de 16 bits sobre HTP v73; no se detalla el esquema de cuantizacion de pesos |
| Idiomas soportados | no disponible (las indicaciones de texto dependen del codificador CLIP de SD 1.5, predominantemente ingles) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | binario de contexto QNN para el UNet y pesos MNN para text_encoder/VAE, distribuidos en `CyberRealistic_qnn2.28_8gen2.zip` |
| Resoluciones soportadas | 512x512, 768x512, 512x768, 768x768 |
| Tamano del repositorio | 1,0 GB |
| Runtime / tier | qnn2.28, tier `8gen2`, HTP `v73` |
| SoC compatibles | Snapdragon 8 Gen 2, 8s Gen 3, 7+ Gen 2, 7 Gen 3 |

## Arquitectura y entrenamiento

La base es Stable Diffusion 1.5, un modelo de difusion latente con tres componentes: un autoencoder variacional (VAE) que comprime imagenes al espacio latente, un UNet que aplica el proceso de eliminacion de ruido y un codificador de texto CLIP que condiciona la generacion. La aportacion de esta ficha no es arquitectonica sino de despliegue: el UNet se ha compilado a un binario de contexto QNN para ejecutarse en la NPU Hexagon, mientras que el codificador de texto y el VAE permanecen en MNN sobre CPU/GPU. Esta particion es habitual porque la NPU ofrece aceleracion en las convoluciones del UNet, la parte mas costosa computacionalmente, mientras que los componentes mas ligeros se dejan en unidades mas flexibles.

No hay informacion disponible sobre el proceso de entrenamiento, el numero de tokens o imagenes utilizadas, la composicion del dataset ni si hubo ajuste por RLHF, DPO o cualquier otra tecnica de alineacion. Tampoco se documenta si el nombre "CyberRealistic" corresponde a un ajuste fino orientado al fotorrealismo o es unicamente una etiqueta del artefacto convertido. El unico detalle tecnico reproducible es la cadena de conversion, publicada en el repositorio GitHub del autor.

## Capacidades

- Generacion de imagenes a partir de indicaciones de texto (text-to-image) en resoluciones de 512x512, 768x512, 512x768 y 768x768.
- Inferencia completamente local en el dispositivo: no requiere conectividad de red ni servicios externos una vez importado el modelo.
- Ejecucion acelerada por NPU (Hexagon HTP v73) para el UNet, con soporte del runtime QNN 2.28.
- Integracion con la aplicacion Android Ruya / Local Dream mediante la opcion Settings > Import Custom Model.
- Capacidades multivariante de resolucion: permite generar en formato cuadrado y panoramico/vertical a partir de la misma compilacion.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo de razonamiento extendido, dado que no es un modelo de lenguaje.

## Casos de uso

- Generacion de imagenes sin conexion en movil: el modelo se importa en Ruya / Local Dream y permite crear ilustraciones cuando no hay cobertura, algo util en entornos rurales, vuelos o recintos con red restringida.
- Prototipado visual de concepto en campo: un disenador puede generar variaciones de una idea durante una reunion con cliente directamente en el telefono, sin depender de una estacion de trabajo ni de una API externa.
- Flujos con requisitos de privacidad: al ejecutarse integramente en el dispositivo, las indicaciones y las imagenes no salen del terminal, lo que resulta adecuado para entornos sanitarios, legales o industriales donde no se permite enviar material a la nube.
- Creacion de recursos graficos para aplicaciones Android: iconos, ilustraciones de marcador de posicion y fondos en las cuatro resoluciones soportadas, utiles durante el desarrollo de una app antes de contratar arte final.
- Demostraciones y formacion sin infraestructura: talleres, ferias y aulas donde no se dispone de GPU ni de red pueden mostrar generacion de imagenes en tiempo real sobre un telefono Snapdragon compatible.
- Base para pipelines de conversion: sirve como referencia reproducible para llevar otros checkpoints SD 1.5 a QNN usando el repositorio de conversion del autor, comparando tiempos de compilacion y comportamiento por tier de SoC.
- Generacion de variaciones de estilo con licencia permisiva: al heredar la licencia CreativeML OpenRAIL-M, permite experimentar con el checkpoint en proyectos personales o internos sujetos a las restricciones de uso de dicha licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad de imagen (FID, CLIP score), latencia por imagen, consumo energetico ni comparaciones cuantitativas con otros runtimes o modelos.

## Requisitos de hardware

- El modelo no se ejecuta en GPU de escritorio ni en VRAM convencional: esta compilado para la NPU Hexagon de Qualcomm. La pregunta relevante es la compatibilidad de SoC, no la VRAM.
- SoC compatibles declarados: Snapdragon 8 Gen 2, 8s Gen 3, 7+ Gen 2 y 7 Gen 3 (tier `8gen2`, HTP `v73`).
- No se declara compatibilidad con otros tiers de HTP ni con SoC Snapdragon anteriores o posteriores distintos de los listados.
- Espacio de almacenamiento: el paquete distribuido ocupa aproximadamente 1,0 GB, al que hay que sumar el espacio de la aplicacion y de los modelos auxiliares.
- Memoria RAM necesaria en el dispositivo: no disponible.
- Opciones de despliegue: aplicacion Android Ruya / Local Dream mediante importacion manual del ZIP; no se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, que ademas no aplican a este formato.
- Latencia y throughput: no disponibles. No se publican tiempos por imagen ni pasos de muestreo recomendados.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion nativa | Contexto de texto | Formato de despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CyberRealistic (esta ficha) | no disponible (base SD 1.5, ~0,98 mil millones segun arquitectura estandar) | 512x512, 768x512, 512x768, 768x768 | 77 tokens (CLIP de SD 1.5, no confirmado por el autor) | QNN context binary + MNN para movil | creativeml-openrail-m | HuggingFace; 0 descargas y 0 me gusta en el momento de la consulta |
| Stable Diffusion 1.5 (checkpoint original) | ~0,98 mil millones | 512x512 | 77 tokens | safetensors / diffusers, orientado a GPU | CreativeML OpenRAIL-M | Ampliamente disponible en HuggingFace |
| Stable Diffusion XL base | ~3,5 mil millones | 1024x1024 | 77 tokens por codificador, dos codificadores de texto | safetensors / diffusers, orientado a GPU | CreativeML OpenRAIL++-M | Ampliamente disponible en HuggingFace |

La comparacion con alternativas de despliegue en movil no es posible con la informacion disponible: no se han encontrado en la busqueda web otros artefactos QNN comparables ni datos de rendimiento que permitan contrastar esta conversion con otras.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al derivar de SD 1.5, el modelo hereda los sesgos demograficos y culturales del dataset de entrenamiento de la base, no caracterizados en esta ficha.
- Riesgo de alucinacion visual: la model card no incluye ninguna evaluacion de fidelidad a la indicacion; es previsible la presencia de artefactos tipicos de SD 1.5, especialmente en manos, texto y composiciones con multiples sujetos.
- Limitacion idiomatica: el codificador CLIP de SD 1.5 esta entrenado predominantemente en ingles; se desconoce el comportamiento con indicaciones en castellano y no hay declaracion de idiomas soportados.
- Limitacion de resolucion: el modelo no genera por encima de 768x768; no hay soporte documentado de ampliacion o de resoluciones mayores.
- Restricciones de licencia: la licencia CreativeML OpenRAIL-M permite uso comercial con obligaciones de atribucion y prohibe usos recogidos en sus clausulas de restriccion (contenido ilegal, danino, desinformacion, entre otros). Es responsabilidad del integrador revisar el texto completo antes de desplegar en produccion.
- Compatibilidad de hardware muy restringida: el artefacto solo funciona en los SoC Snapdragon listados con la version de runtime qnn2.28 y el tier `8gen2`. No es portable a otros aceleradores.
- Ausencia de mantenimiento verificable: el repositorio registra 0 descargas y 0 me gusta, fue creado y actualizado el mismo dia y no hay senales de soporte, versionado o incidencias resueltas.
- Falta de documentacion: no hay informacion sobre la procedencia del checkpoint "CyberRealistic", el dataset de ajuste ni las condiciones exactas de cuantizacion, lo que dificulta auditar sesgos o reproducir resultados.

## Enlaces

- HuggingFace: https://huggingface.co/matrixportalx/CyberRealistic
- Repositorio de conversion SD 1.5 a Qualcomm QNN: https://github.com/matrixportalx/Sd-1.5-Converting-to-Qualcomm-QNN-Model
- Aplicacion Ruya / Local Dream: la model card la referencia como destino de importacion, pero no incluye enlace directo.
- Los resultados de la busqueda web proporcionada no contienen enlaces relevantes para este modelo: corresponden a dominios de una compania de seguros y no guardan relacion con el artefacto.
