# Hcompany/Holo-3.1-35B-A3B

## Resumen

Holo3.1-35B-A3B es un modelo de lenguaje multimodal (vision-language) desarrollado por H Company, especializado en agentes de uso de computadora (computer use agents). Forma parte de la familia Holo3.1, que abarca tamaños desde 0.8B hasta 35B-A3B, y está diseñado para automatizar tareas en entornos web, escritorio y móvil mediante la interpretación de capturas de pantalla y la ejecución de acciones. El modelo se construye sobre la arquitectura Qwen3.5-MoE y añade capacidades nativas de function calling, lo que permite su integración directa en frameworks de agentes.

La relevancia de este modelo radica en su enfoque en despliegue local y eficiencia de costes: ofrece cuantizaciones optimizadas (BF16, FP8, NVFP4, Q4 GGUF) que permiten ejecutarlo en hardware de consumo, manteniendo un rendimiento competitivo frente a modelos propietarios de agentes de interfaz gráfica. Con 35.107 millones de parámetros totales y 3.000 millones activos, se posiciona como una alternativa open source con licencia Apache 2.0 para automatización de GUI, grounding de UI y flujos de trabajo empresariales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-MoE (vision-language, transformer con mezcla de expertos) |
| Parametros totales | 35.107.181.936 (35,1B) |
| Parametros activos | 3.000 millones (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, FP8, NVFP4, Q4 GGUF |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tambien GGUF para cuantizacion Q4) |

## Arquitectura y entrenamiento

Holo3.1-35B-A3B utiliza una arquitectura de mezcla de expertos (MoE) basada en la familia Qwen 3.5, con 35.100 millones de parametros totales y 3.000 millones activos por token. Es un modelo multimodal que procesa entradas de imagen y texto (pipeline image-text-to-text), diseñado especificamente para tareas de navegacion y control de interfaz grafica. El modelo hereda la arquitectura qwen3_5_moe, que combina atencion por ventanas con capas de expertos para equilibrar capacidad y eficiencia computacional.

El entrenamiento se apoya en los modelos base Qwen/Qwen3.6-35B-A3B, Qwen/Qwen3.5-9B, Qwen/Qwen3.5-4B y Qwen/Qwen3.5-0.8B, lo que sugiere un enfoque de destilacion o continuacion de entrenamiento sobre la familia Qwen. No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens utilizados o si se aplicaron tecnicas de RLHF o DPO. La innovacion principal reside en la incorporacion de soporte nativo para function calling y la optimizacion para despliegue local mediante cuantizaciones de bajo bit (FP8, NVFP4, Q4 GGUF), que reducen los requisitos de memoria sin sacrificar excesivamente el rendimiento en tareas de agente.

## Capacidades

- Generacion de texto y razonamiento multimodal: procesa imagenes y texto para comprender el estado de una interfaz grafica y decidir la siguiente accion.
- Automatizacion de navegador, escritorio y movil: puede controlar el raton, el teclado y gestos tactiles en entornos web, aplicaciones de escritorio y dispositivos moviles.
- UI grounding: localiza elementos concretos en una captura de pantalla (botones, campos de texto, menus) y devuelve sus coordenadas o identificadores.
- Function calling nativo: puede invocar herramientas y APIs externas, lo que facilita su integracion en frameworks de agentes como LangChain o sistemas propios.
- Ejecucion de agentes multi-paso: mantiene el estado de la conversacion y ejecuta secuencias de acciones para completar tareas complejas.
- Despliegue local eficiente: gracias a las cuantizaciones disponibles, puede ejecutarse en GPUs de consumo con requisitos de VRAM reducidos.

## Casos de uso

- Automatizacion de pruebas de interfaz de usuario: el modelo puede navegar por una aplicacion web, hacer clic en elementos y verificar flujos, reduciendo el esfuerzo manual en pipelines de QA. Su capacidad de grounding permite localizar botones y campos con precision.
- Asistentes de soporte tecnico remoto: un agente basado en Holo3.1 puede tomar el control de la pantalla de un usuario, diagnosticar problemas y ejecutar acciones correctivas, guiado por capturas en tiempo real.
- Automatizacion de procesos empresariales (RPA): en lugar de scripts rigidos, el modelo puede adaptarse a cambios en la interfaz de aplicaciones de gestion (ERP, CRM) y completar tareas como rellenar formularios o extraer datos.
- Agentes de compra y reservas online: el modelo puede navegar por sitios de comercio electronico, comparar precios, anadir productos al carrito y completar el proceso de pago, siguiendo instrucciones en lenguaje natural.
- Automatizacion de tareas en movil: con soporte para entornos moviles, puede ejecutar acciones en apps de Android o iOS, como enviar mensajes, configurar alarmas o gestionar notificaciones.
- Creacion de demos y prototipos interactivos: los desarrolladores pueden usar el modelo para generar secuencias de acciones sobre una interfaz y validar rapidamente flujos de usuario antes de implementarlos.
- Asistentes de productividad personal: el modelo puede automatizar tareas repetitivas en el escritorio, como organizar archivos, enviar correos o programar reuniones, mediante instrucciones conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye referencias a figuras que comparan el rendimiento con la familia Qwen 3.5 en tareas de computer use, mobile automation, enterprise workflows y UI grounding, pero los datos numericos no estan disponibles en texto. Se recomienda consultar el blog oficial de H Company (hcompany.ai/holo3.1) para obtener las tablas completas.

## Requisitos de hardware

- VRAM estimada para inferencia: 70,6 GB en precision BF16 (segun LLM Explorer). Con cuantizacion FP8 se reduce aproximadamente a 35 GB, con NVFP4 a unos 18 GB y con Q4 GGUF a unos 20 GB.
- GPUs recomendadas: para BF16 se necesitan GPUs profesionales como A100 80GB o H100. Con FP8 o NVFP4 puede ejecutarse en una RTX 4090 (24 GB) o RTX 6000 Ada. La cuantizacion Q4 GGUF permite su uso en GPUs de 24 GB o incluso menos con offloading a CPU.
- Compatibilidad con GPU de consumo: si, gracias a las cuantizaciones FP8, NVFP4 y GGUF, el modelo cabe en GPUs de gama alta para consumidores (RTX 4090) y en algunas de gama media con GGUF.
- Opciones de despliegue: transformers (libreria principal), vLLM para inferencia de alto rendimiento, llama.cpp para GGUF, y la plataforma de H Company (hub.hcompany.ai) que ofrece un quickstart para integracion.
- Latencia y throughput: no disponible. Al ser un modelo MoE con solo 3B parametros activos, la latencia por token es significativamente menor que la de un modelo denso de 35B, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Enfoque |
|---|---|---|---|---|---|
| Holo3.1-35B-A3B | 35,1B totales, 3B activos | no disponible | imagen + texto | Apache 2.0 | Computer use, GUI agents |
| Qwen3.5-35B-A3B (base) | 35,1B totales, 3B activos | no disponible | texto | Apache 2.0 | Modelo base de lenguaje |
| Holo3.1-9B | 9B densos | no disponible | imagen + texto | Apache 2.0 | Computer use, GUI agents |
| Holo3.1-4B | 4B densos | no disponible | imagen + texto | Apache 2.0 | Computer use, GUI agents |

No se dispone de datos de rendimiento comparativos en texto. La familia Holo3.1 se posiciona frente a modelos propietarios de agentes de GUI como GPT-4V o Claude, pero no hay benchmarks publicados que permitan una comparacion cuantitativa en esta ficha.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado principalmente en ingles, puede mostrar un rendimiento inferior en otras lenguas o contextos culturales no representados en los datos de entrenamiento.
- Riesgo de alucinacion: como cualquier VLM, puede generar descripciones de elementos de interfaz que no existen o ejecutar acciones incorrectas si la captura de pantalla es ambigua o de baja resolucion.
- Limitaciones de contexto: no se ha especificado la longitud de contexto; en tareas de agentes largas, podria ser insuficiente para mantener el historial completo de interacciones.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero se debe mantener el aviso de copyright y las patentes asociadas.
- Requisitos de hardware: la version BF16 requiere mas de 70 GB de VRAM, lo que limita su uso a centros de datos o estaciones de trabajo profesionales.
- Riesgos de seguridad: al ser un modelo disenado para controlar interfaces, un uso malintencionado podria automatizar acciones fraudulentas o no autorizadas. Se recomienda implementar mecanismos de supervision humana.
- Dependencia de la familia Qwen: al estar basado en Qwen 3.5, hereda sus limitaciones en cuanto a idiomas y sesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hcompany/Holo-3.1-35B-A3B
- Version cuantizada FP8: https://huggingface.co/Hcompany/Holo-3.1-35B-A3B-FP8
- Blog oficial de Holo3.1: https://hcompany.ai/holo3.1
- Guia de inicio rapido: https://hub.hcompany.ai/quickstart
- Documentacion de la API de modelos Holo: https://hcompany.ai/holo-models-api
- Ficha en LLM Explorer: https://llm-explorer.com/model/Hcompany%2FHolo-3.1-35B-A3B,3KETaqPmYgIr5j2AIBIN32
