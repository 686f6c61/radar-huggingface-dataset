# mradermacher/Ornith-1.5-35B-A3B-heretic-ja-GGUF

## Resumen

Ornith-1.5-35B-A3B-heretic-ja es una variante del modelo Ornith-1.5-35B-A3B, un modelo de lenguaje de arquitectura mixta (MoE) desarrollado por el equipo Ornith. Esta version concreta, cuantizada por mradermacher, se ha sometido a un proceso de "abliteracion" para eliminar los rechazos y restricciones de seguridad tipicos de los modelos alineados, dando lugar a una version "uncensored" o "heretica". El modelo base fue entrenado con un enfoque en razonamiento, codigo y capacidades de agente.

Esta ficha se centra en el archivo GGUF, que permite ejecutar el modelo en entornos locales con llama.cpp, Ollama u otros motores compatibles. El modelo cuenta con 34.660 millones de parametros totales pero solo activa alrededor de 3 mil millones por token gracias a su arquitectura MoE, lo que lo hace sorprendentemente eficiente para su tamano. Esta version se publico el 23 de agosto de 2026 y no ha recibido descargas ni "me gusta" en el momento de redactar esta ficha, lo que sugiere que es un lanzamiento reciente o poco difundido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | ~3 B (aproximadamente) |
| Longitud de contexto | no disponible en la informacion del modelo, pero el modelo base Ornith-1.5-35B-A3B soporta hasta 256k segun fuentes externas |
| Tipos de cuantizacion | Q2_K, Q4_K_S, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizacion de mradermacher) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un modelo de lenguaje de arquitectura Mixture of Experts con 34,66 mil millones de parametros totales y solo 3 mil millones de parametros activos por token. Esta arquitectura permite un rendimiento superior al de modelos densos de tamano similar, como Gemma 4-31B o Muse Glimmer-30B, con un coste computacional mucho menor. El modelo fue entrenado con un enfasis en codigo, razonamiento y capacidades de agente.

La variante "heretic-ja" ha sido sometida a un proceso de "abliteracion" (abliteration) que elimina los mecanismos de rechazo del modelo, eliminando las barreras de seguridad que impiden generar contenido sensible o prohibido. Ademas, incorpora un ajuste fino con LoRA especifico (ara-lora) para mejorar sus capacidades. El resultado es un modelo que no rechaza peticiones y que puede generar contenido que otros modelos se negarian a producir. La cuantizacion GGUF realizada por mradermacher permite ejecutar el modelo en una variedad de hardware, desde GPU de consumo hasta servidores profesionales.

## Capacidades

- Generacion de texto de alta calidad, con especial habilidad en tareas de codigo, razonamiento y logica.
- Razonamiento complejo y resolucion de problemas en varios pasos (multi-step reasoning).
- Capacidad de agente: puede planificar y ejecutar acciones secuenciales, integrarse con herramientas y APIs.
- Soporte de tool calling / function calling, lo que permite integrarse en pipelines de automatizacion.
- Capacidad multimodal: el repositorio incluye archivos mmproj para procesamiento de imagenes, aunque no se especifica el detalle de esta capacidad.
- Generacion de texto sin censura, gracias al proceso de abliteracion.
- Soporte de contexto largo, con hasta 256k tokens de contexto (segun fuentes externas).

## Casos de uso

- **Asistente de codigo en local**: el modelo puede integrarse en entornos de desarrollo como VSCode o Neovim para proporcionar autocompletado, sugerencias y generacion de codigo, gracias a su eficiencia (solo 3 B parametros activos) que permite ejecutarse en GPU de consumo con cuantizacion Q4.
- **Agente autonomo de desarrollo**: dado su soporte de tool calling y razonamiento multi-paso, se puede usar para crear agentes que busquen en la web, ejecuten comandos y modifiquen codigo automaticamente, todo sin censura.
- **Generacion de contenido creativo sin restricciones**: el modelo es adecuado para escribir ficcion, guiones o contenido que explore temas tabu o controvertidos sin los limites habituales de los modelos alineados.
- **Investigacion academica en IA**: sirve para estudiar el impacto de la abliteracion en el comportamiento de los modelos, comparando su rendimiento con la version original y con otros modelos alineados.
- **Sistemas de chat y roleplay**: su capacidad de mantener conversaciones largas (hasta 256k tokens) y su naturaleza sin censura lo hacen ideal para aplicaciones de roleplay y chat inmersivo.
- **Automatizacion de tareas de procesamiento de texto**: puede realizar tareas de resumen, traduccion, extraccion de informacion y clasificacion de texto con un rendimiento notable, gracias a su capacidad de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta cuantizacion especifica. Sin embargo, el modelo base Ornith-1.5-35B-A3B supera a Qwen 3.6-35B en todos los benchmarks de codigo y agente, y supera a modelos densos como Gemma 4-31B y Muse Glimmer-30B, segun la informacion publica del modelo base. No se proporcionan cifras concretas en la documentacion revisada.

## Requisitos de hardware

- **VRAM estimada para inferencia**: la cuantizacion Q4_K_S ocupa aproximadamente 20 GB, por lo que se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A5000). La cuantizacion Q8_0 requiere unos 37 GB, por lo que necesita una GPU profesional como A100 o H100, o el uso de CPU con RAM abundante.
- **GPU recomendadas**: para una experiencia optima con Q4_K_S, una RTX 4090 o A6000 (48 GB) es suficiente. Para Q8_0, se recomienda A100 (80 GB) o H100.
- **Uso en GPU de consumo**: si, con cuantizaciones Q2_K (13 GB) o Q4_K_S (20 GB) se puede ejecutar en una RTX 3090/4090, aunque con limitaciones de velocidad.
- **Opciones de despliegue**: el formato GGUF es compatible con llama.cpp, Ollama, LM Studio, text-generation-webui y otros motores de inferencia local. Para despliegue en servidor, se puede usar vLLM con la version original (safetensors).
- **Latencia y throughput**: no disponible. Se espera que la cuantizacion Q4_K_S ofrezca un rendimiento entre 20 y 40 tokens por segundo en una GPU moderna de gama alta, gracias a la arquitectura MoE.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Puntos fuertes |
|--------|------------|----------|----------|----------------|
| Ornith-1.5-35B-A3B-heretic-ja (este) | 34,66 B totales, 3 B activos | 256k | MIT | Sin censura, codigo y agente, eficiencia MoE |
| Qwen 3.6-35B | 35 B | no disponible | Apache 2.0 | Modelo denso, buen rendimiento general, pero inferior en codigo y agente |
| Gemma 4-31B | 31 B | no disponible | Gemma license | Modelo denso de Google, bueno en razonamiento, pero inferior a Ornith en codigo |
| Llama 3.3-70B | 70 B | 128k | Llama license | Modelo denso mas grande, mejor rendimiento bruto pero menos eficiente |

## Limitaciones y advertencias

- **Contenido sin censura**: este modelo no tiene las barreras de seguridad habituales. Puede generar contenido ofensivo, ilegal, peligroso o eticamente cuestionable. El usuario es el unico responsable del uso que haga del modelo.
- **Alucinaciones**: como todos los modelos de lenguaje, puede inventar informacion, especialmente en temas desconocidos o poco representados en sus datos de entrenamiento. La abliteracion puede aumentar la frecuencia de alucinaciones.
- **Sesgos**: al ser un modelo entrenado con datos de internet, puede reproducir los sesgos y prejuicios presentes en los datos.
- **Idioma**: el modelo esta entrenado principalmente en ingles, por lo que su rendimiento en otros idiomas puede ser inferior.
- **Contexto**: aunque el modelo base soporta hasta 256k tokens, en la practica el rendimiento puede degradarse con contextos muy largos, y la memoria necesaria aumenta considerablemente.
- **Licencia**: aunque la licencia es MIT, el modelo ha sido modificado para eliminar las restricciones de seguridad. El uso comercial es posible, pero el usuario debe evaluar las implicaciones eticas y legales.
- **Reproducibilidad**: el proceso de abliteracion no es estandarizado, por lo que el comportamiento del modelo puede variar y no ser totalmente reproducible.

## Enlaces

- [Repositorio HuggingFace del modelo cuantizado](https://huggingface.co/mradermacher/Ornith-1.5-35B-A3B-heretic-ja-GGUF)
- [Modelo base original (OS-Software)](https://huggingface.co/OS-Software/Ornith-1.5-35B-A3B-heretic-ja)
- [Modelo base Ornith-1.5-35B-A3B](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B)
- [Pagina del modelo en ModelScope](https://www.modelscope.cn/models/ornith-ai/Ornith-1.5-35B-A3B)
- [Repositorio GitHub con informacion del modelo](https://github.com/MiaAI-Lab/Ornith-1.5-35B-A3B-DGX-Spark/blob/main/README.md)
- [Analisis del modelo para agentes de codigo](https://wavespeed.ai/blog/ai-models/ornith-1-5-35b-a3b-review/)
