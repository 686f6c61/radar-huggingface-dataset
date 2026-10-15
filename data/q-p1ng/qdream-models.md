# Q-P1NG/qdream-models

## Resumen

Q-Dream models es una colección de modelos de generación de imágenes texto-a-imagen (text-to-image) preparados por Q-P1NG para su motor Q-Dream, orientados a la ejecución local en teléfonos Android. No se trata de un modelo entrenado desde cero, sino de un conjunto de derivados cuantizados de tres modelos base de la familia Stable Diffusion 1.5 (Lykon/dreamshaper-8-lcm, SG161222/Realistic_Vision_V6.0_B1_noVAE y cyberdelia/CyberRealistic) con el sampler LCM y el decodificador TAESD, empaquetados como bundles autocontenidos.

El objetivo es claro: generar imágenes de 512×512 píxeles en menos de un segundo en la NPU de un Snapdragon 8 Elite, y generar sin conexión en la CPU de cualquier arm64 con 6 GB de RAM o más. El repositorio ocupa 10,3 GB y contiene 11 bundles que cubren las versiones de Hexagon v73, v75, v79 y v81 para NPU, más tres bundles int8 para CPU. No interviene ningún servidor: los prompts y las imágenes no salen del teléfono.

Su relevancia actual radica en que traslada un pipeline de difusión completo (codificador de texto CLIP, UNet y decodificador) al hardware de un móvil con latencias por debajo del segundo en gama alta, con verificación de fidelidad frente al UNet en FP32 y una licencia propia que permite uso comercial bajo condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (UNet + codificador de texto CLIP BPE + decodificador VAE con TAESD), muestreo LCM |
| Parametros totales | no disponible (los bundles se distribuyen cuantizados; no se indica el recuento de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como contexto conversacional; la entrada es un prompt de texto tokenizado con BPE de CLIP (limite habitual de 77 tokens en SD 1.5) |
| Tipos de cuantizacion | NPU: int8 en pesos con activaciones int16 (w8a16); CPU: int8 (MNN); se uso UNet en FP32 como referencia de validacion |
| Idiomas soportados | ingles (en); los prompts funcionan mejor en ingles |
| Licencia | Q-P1NG Q-Dream Model License, con las restricciones de uso de CreativeML Open RAIL-M y Open RAIL++-M |
| Formato de pesos | .mnn (MNN 3.6) y .bin (binarios de contexto QNN HTP, QAIRT 2.50); manifiesto bundle.json, export_meta.json y tokenizer CLIP BPE |
| Resolucion por defecto | 512 px en NPU, 384 px en CPU |
| Pasos de muestreo | 6 (rango soportado de 4 a 8), guidance 1-2 |
| Tamano por bundle | 1,01 GB (NPU) y 1,10 GB (CPU) |

## Arquitectura y entrenamiento

La arquitectura es la de Stable Diffusion 1.5: un UNet de difusion latente con prediccion epsilon, scheduler de betas lineal-escalado, un codificador de texto CLIP con tokenizador BPE y un decodificador de imagenes. Sobre esa base se aplica muestreo LCM (Latent Consistency Model) con 4-8 pasos y guidance 1-2, y se usa TAESD como decodificador rapido; en los bundles de CPU se incluye ademas el VAE completo de SD 1.5 para una decodificacion final de mayor calidad. En los bundles de CyberRealistic y Realistic Vision, el LCM-LoRA va fusionado en los pesos.

No se publican datos de entrenamiento propios: la ficha no indica numero de tokens, composicion del dataset ni procesos de RLHF o DPO, porque el trabajo realizado es de cuantizacion, fusion de adaptadores y empaquetado para inferencia en dispositivo, no de entrenamiento. La innovacion tecnica destacable es la compilacion de binarios de contexto QNN HTP por generacion de Hexagon y la validacion de fidelidad: cada UNet de NPU (w8a16) se comparo con su equivalente en FP32 sobre 8 entradas reales de muestreo LCM en S23, S24 y S25, con similitud coseno de 0,998 a 0,99998. La cuantizacion con activaciones de 8 bits, exigida por chips Hexagon v68/v69 mas antiguos, se probo y se descarto porque destruye la imagen.

## Capacidades

- Generacion de imagenes texto-a-imagen sin conexion a partir de un prompt en ingles, a 512×512 px en NPU y 384×384 px en CPU.
- Muestreo rapido con LCM: 4-8 pasos con guidance 1-2, frente a las decenas de pasos de un sampler DDIM o Euler tradicional.
- Tres estilos cubiertos: DreamShaper 8 LCM (ilustracion y estilo generalista), CyberRealistic Final (estilo fotografico) y Realistic Vision V6.0 B1 (retrato y realismo).
- Ejecucion en NPU Hexagon de Snapdragon mediante binarios QNN HTP compilados por generacion (v73, v75, v79, v81).
- Ejecucion en CPU arm64 mediante modelos MNN int8, con el VAE completo para la decodificacion final.
- Integridad verificable: cada bundle incluye bundle.json con el SHA-256 de todos los ficheros.
- Uso como biblioteca por terceros: los .mnn son modelos MNN y los .bin son binarios de contexto QNN que pueden cargarse con el runtime de Qualcomm.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo de pensamiento: es exclusivamente un pipeline de difusion texto-a-imagen.
- Capacidad multilingue: no. El unico idioma declarado es el ingles y la propia ficha recomienda escribir los prompts en ingles.

## Casos de uso

- Generacion de imagenes offline con privacidad: al no intervenir ningun servidor, los prompts y las imagenes nunca salen del dispositivo; es adecuado para aplicaciones de diario personal, notas o mensajeria donde el contenido es sensible.
- Aplicaciones moviles de creatividad: integracion del bundle NPU correspondiente al chip del telefono para ofrecer generacion de ilustraciones en menos de un segundo por imagen, con una experiencia interactiva de prueba y error.
- Prototipado y demostraciones sin backend: un equipo puede validar una idea de producto de generacion de imagenes desplegando un APK con el bundle `dreamshaper8-lcm-int8` en cualquier arm64 con 6 GB de RAM, sin coste de GPU en la nube.
- Filtros y estilizado en apps de camara o galeria: los bundles de CyberRealistic y Realistic Vision, de corte fotografico, permiten generar variaciones realistas de una escena a partir de una descripcion textual.
- Generacion de avatares e ilustraciones para juegos o redes sociales: los 6 pasos y el guidance bajo permiten encadenar varias propuestas por segundo en gama alta y elegir la mejor.
- Funcionalidad diferencial en dispositivos sin conectividad: el modo CPU int8 (unos 7 s en un Tensor G4 en linea de comandos) permite ofrecer la funcion en entornos sin red, en aviones o en zonas con cobertura deficiente.
- Despliegue embebido en hardware Android industrial: el bundle MNN int8 puede integrarse en quioscos, terminales de punto de venta o paneles que necesiten generar imagenes localmente sin depender de servicios externos.
- Evaluacion comparativa de cuantizacion: util como referencia para investigadores que quieran medir el impacto de w8a16 frente a FP32 en un UNet de SD 1.5, dado que la ficha publica la similitud coseno obtenida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP score, MMLU u otros) en la informacion disponible. Si se publican mediciones de latencia, memoria y fidelidad de cuantizacion.

| Dispositivo | Bundle | Resultado |
|---|---|---|
| Snapdragon 8 Elite, app de Q-P1NG | NPU v79, 512 px, 6 pasos | 0,91-0,93 s por imagen (codificador de texto 60 ms, UNet 0,70 s, decodificador 38 ms); 1,5-1,6 s incluyendo carga del motor y guardado; pico de memoria 1,4 GB |
| Snapdragon 8 Elite, motor de linea de comandos, en caliente | NPU v79, 512 px, 6 pasos | 0,76 s |
| Galaxy S25 / S24 / S23 (perfiles de Qualcomm AI Hub) | NPU v79 / v75 / v73 | UNet 124 / 162 / 201 ms por paso; TAESD en NPU 8,9 ms (S25) |
| Galaxy S25 (perfiles de Qualcomm AI Hub) | CyberRealistic Final NPU v79 | UNet 122 ms por paso, similar a DreamShaper |
| Pixel 10a (Tensor G4), linea de comandos, en caliente | CPU int8, 384 px, 6 pasos | unos 7 s |
| Pixel 10a, app de Q-P1NG | CPU int8, 384 px, 6 pasos | 12-13 s (la app recarga el motor en cada imagen) |

Fidelidad de cuantizacion: similitud coseno de 0,998 a 0,99998 entre cada UNet de NPU (w8a16) y su equivalente FP32, medida sobre 8 entradas reales de muestreo LCM en S23, S24 y S25. Los bundles v81 estan compilados a partir de los mismos modelos cuantizados pero aun no se han perfilado.

## Requisitos de hardware

- NPU Qualcomm Hexagon: los bundles NPU requieren un SoC con la version de Hexagon indicada en el nombre de la carpeta. v73 cubre Snapdragon 8 Gen 2 y 7 Gen 4; v75, Snapdragon 8 Gen 3; v79, Snapdragon 8 Elite; v81, Snapdragon 8 Elite Gen 5.
- Runtime QNN: los binarios .bin se cargan con un runtime QNN de version 2.50 o posterior, construidos con QAIRT 2.50.
- Memoria: pico de 1,4 GB medido en Snapdragon 8 Elite con el bundle NPU v79 a 512 px; para los bundles de CPU se indica un minimo de 6 GB de RAM en un telefono arm64.
- Chips no compatibles con NPU: Snapdragon 888, 778G y 8 Gen 1 deben usar los bundles de CPU, porque la cuantizacion con activaciones de 8 bits que exigen los Hexagon v68/v69 degrada la imagen.
- GPU de escritorio: no disponible. La ficha no documenta rutas de despliegue en GPU de PC (CUDA, ROCm) ni VRAM estimada para A100, H100 o RTX 4090.
- Despliegue: app de Q-P1NG (descarga el bundle correcto y verifica cada fichero contra bundle.json), modelos MNN interpretables por MNN 3.6 o posterior (se recomienda una version reciente con soporte de bajo consumo de memoria) y binarios QNN HTP cargables con herramientas como qnn-context-binary-utility.
- No se documenta integracion con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un pipeline de difusion como este.
- Latencia y throughput: de 0,76 s a 0,93 s por imagen de 512 px en Snapdragon 8 Elite, alrededor de 7 s por imagen de 384 px en Tensor G4 por CPU en linea de comandos y 12-13 s en la app. No se publican cifras de throughput agregado ni de generacion por lotes.

## Comparativa con modelos similares

La informacion disponible no incluye comparaciones de rendimiento con soluciones de terceros para generacion de imagenes en dispositivo. La comparacion posible es entre las tres familias incluidas en el propio repositorio.

| Familia de bundles | Modelo base | Destino | Tamano | Resolucion y pasos |
|---|---|---|---|---|
| `dreamshaper8-lcm-npu-v*` | Lykon/dreamshaper-8-lcm | NPU Hexagon v73/v75/v79/v81 | 1,01 GB | 512 px, 6 pasos |
| `cyberrealistic-final-lcm-npu-v*` | cyberdelia/CyberRealistic + LCM-LoRA fusionado | NPU Hexagon v73/v75/v79/v81 | 1,01 GB | 512 px, 6 pasos |
| `dreamshaper8-lcm-int8` | Lykon/dreamshaper-8-lcm | CPU arm64 | 1,10 GB | 384 px, 6 pasos |
| `cyberrealistic-final-lcm-int8` | cyberdelia/CyberRealistic + LCM-LoRA fusionado | CPU arm64 | 1,10 GB | 384 px, 6 pasos |
| `realisticvision6-lcm-int8` | SG161222/Realistic_Vision_V6.0_B1_noVAE + LCM-LoRA fusionado | CPU arm64 | 1,10 GB | 384 px, 6 pasos |

Frente a los modelos base originales (DreamShaper 8 LCM, Realistic Vision V6.0 B1 y CyberRealistic), la diferencia es de formato y tamano: los originales se distribuyen en safetensors para GPU, mientras que estos bundles son cuantizaciones int8 empaquetadas para NPU Hexagon o CPU arm64. No hay datos publicados que permitan comparar la calidad resultante con alternativas moviles de otros proveedores.

## Limitaciones y advertencias

- Los bundles no incluyen ningun safety checker. La propia ficha indica que las aplicaciones deben anadir su propio filtrado de contenido y hacer cumplir las restricciones de uso.
- Licencia de tipo RAIL: el uso comercial esta permitido, pero sujeto a las restricciones de CreativeML Open RAIL-M y Open RAIL++-M, que deben transmitirse al usuario final como condicion exigible. Es obligatorio incluir LICENSE.md y NOTICE.md y dar credito a "Q-Dream models by Q-P1NG".
- La base es Stable Diffusion 1.5, una arquitectura de 2022 con resolucion nativa de 512 px; no compite en calidad fotografica con modelos de difusion mas recientes y mayores.
- Cuantizacion agresiva: los pesos son int8. La validacion reportada es buena en similitud coseno, pero se midio solo sobre 8 entradas de muestreo y en tres dispositivos; puede haber degradacion en prompts fuera de esa distribucion.
- Idiomas: el unico idioma declarado es el ingles y la ficha recomienda prompts en ingles. Los prompts en castellano pueden degradar el resultado.
- La cuantizacion con activaciones de 8 bits se descarto por destruir la imagen, lo que deja fuera a los chips Hexagon v68/v69 (Snapdragon 888, 778G, 8 Gen 1), relegados a los bundles de CPU.
- Dependencia del hardware: los binarios QNN solo cargan en la generacion de Hexagon para la que se compilaron y requieren runtime QNN 2.50 o superior.
- Riesgo de alucinacion visual inherente a los modelos de difusion: artefactos anatomicos, texto ilegible en la imagen, manos deformadas y fidelidad limitada al prompt.
- No hay informacion publicada sobre sesgos demograficos, representacion de colectivos ni evaluacion de contenido nocivo.
- Los bundles v81 no estan perfilados, por lo que no hay mediciones de rendimiento para Snapdragon 8 Elite Gen 5.
- Tamano de repositorio de 10,3 GB: descargar el conjunto completo no es viable en muchos moviles sin seleccionar un unico bundle.
- Los bundles estan pensados para la app de Q-P1NG; el uso desde otro software exige gestionar manualmente el tokenizer, los parametros del scheduler en export_meta.json y el runtime correspondiente.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/Q-P1NG/qdream-models
- Perfil del autor: https://huggingface.co/Q-P1NG
- Licencia del modelo (LICENSE.md): https://huggingface.co/Q-P1NG/qdream-models/blob/main/LICENSE.md
- Modelo base DreamShaper 8 LCM: https://huggingface.co/Lykon/dreamshaper-8-lcm
- Modelo base Realistic Vision V6.0 B1 (sin VAE): https://huggingface.co/SG161222/Realistic_Vision_V6.0_B1_noVAE
- Modelo base CyberRealistic: https://huggingface.co/cyberdelia/CyberRealistic
- Repositorio de MNN (runtime para los ficheros .mnn): https://github.com/alibaba/MNN
- La busqueda web proporcionada no devolvio resultados relevantes: los enlaces recibidos corresponden a articulos sobre la letra Q y no guardan relacion con este modelo. No se dispone de enlaces adicionales a papers, blogs o demos.
