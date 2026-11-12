# Denovarix/Rix

## Resumen

Rix es un modelo de generación de imágenes a partir de texto (text-to-image) anunciado por Denovarix Technologies LLP, una empresa con sede en West Bengal (India), como parte de su familia de modelos propios Denovarix e integrado en su sistema operativo DNX OS. El modelo se presenta como una herramienta orientada a uso empresarial: generación de imágenes de producto, banners, ilustraciones para presentaciones e informes, publicaciones en redes sociales y material gráfico que respete la identidad corporativa (colores y logotipos) de la empresa. Su propuesta diferencial es la ejecución totalmente on-premise sobre el servidor de alto rendimiento DNX, dentro de la infraestructura del cliente, de modo que las descripciones introducidas y las imágenes generadas no salen de la organización.

En el momento de redactar esta ficha, el modelo se encuentra en desarrollo y no está disponible: la model card indica explícitamente que los pesos no se publican en Hugging Face y que la página describe un modelo en construcción. No se han publicado datos técnicos sobre arquitectura, número de parámetros, longitud de contexto, proceso de entrenamiento ni resultados de benchmarks. El repositorio registra cero descargas y cero interacciones, lo que es coherente con un anuncio previo al lanzamiento.

La relevancia de Rix, por tanto, es prospectiva: apunta a un nicho concreto, el de la generación de imágenes generativa desplegada en servidores propios para empresas con requisitos de confidencialidad, y a una integración vertical con un ecosistema de productividad (DNX OS, Nova, DNX Presentation). Cualquier evaluación técnica rigurosa deberá esperar a la publicación de pesos, documentación de arquitectura y métricas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (la model card indica "Size: To be announced") |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | no disponible (los pesos no están publicados) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo. La model card no especifica si se trata de un transformer de difusión (por ejemplo, un UNet o un Diffusion Transformer), de un modelo autorregresivo de imágenes o de otra familia de modelos generativos. Tampoco se detalla el número de parámetros, la resolución nativa de generación, el codificador de texto empleado ni el mecanismo de condicionamiento.

Respecto al entrenamiento, no hay datos sobre el volumen de pares texto-imagen utilizados, la composición del dataset, la procedencia de los datos, ni si se aplicaron técnicas de ajuste fino (RLHF, DPO u otras) o de alineación con preferencias. La única información funcional es la orientación declarada hacia imágenes de uso empresarial y el cumplimiento de reglas de marca (colores corporativos y logotipos), lo que sugiere, sin confirmación documental, algún mecanismo de condicionamiento o control de estilo; se trata de una inferencia a partir del texto de la model card, no de un dato técnico verificado.

## Capacidades

- Generación de imágenes a partir de descripciones de texto en inglés (pipeline declarado: text-to-image).
- Generación orientada a imágenes de producto y banners publicitarios.
- Generación de ilustraciones para presentaciones e informes.
- Generación de visuales para redes sociales.
- Alineación declarada con reglas de identidad corporativa (colores y logotipos de la empresa).
- Ejecución on-premise sobre hardware propio del cliente (servidor DNX), con permanencia de los datos dentro de la organización.
- Integración prevista con herramientas del ecosistema DNX OS: Nova, DNX Presentation y herramientas de diseño.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (solo se declara inglés).
- Modo de razonamiento (thinking mode), visión o audio: no disponible.

## Casos de uso

- Generación de imágenes de producto para catálogos y comercio electrónico: el modelo se usaría para crear fotografías sintéticas de producto a partir de descripciones textuales, reduciendo la dependencia de sesiones fotográficas; encaja en el perfil declarado de "product shots".
- Creación de banners y creatividades publicitarias: útil para equipos de marketing que necesitan variantes de un anuncio con la paleta y el logotipo de la marca, aprovechando la orientación declarada a reglas de identidad corporativa.
- Ilustraciones para presentaciones e informes corporativos: integrado en DNX Presentation, permitiría generar gráficos de apoyo para diapositivas y documentos internos sin salir del entorno de la empresa.
- Contenido para redes sociales: generación rápida de imágenes para publicaciones periódicas, con el requisito de confidencialidad que justifica el despliegue on-premise.
- Entornos con requisitos estrictos de confidencialidad: organizaciones que no pueden enviar prompts ni material gráfico a servicios en la nube (sector sanitario, legal, administración pública, defensa) podrían usar Rix en su propio servidor DNX, manteniendo los datos dentro de la infraestructura.
- Pilotos de generación de imágenes en el puesto de trabajo: a través de Nova y las herramientas de diseño de DNX OS, los equipos creativos podrían generar borradores y variaciones dentro del flujo de trabajo habitual, pendiente de confirmación de disponibilidad.
- Evaluación previa a compra (POC): la empresa ofrece acceso de evaluación y pilotos mediante contacto directo, lo que permite validar la calidad de generación sobre hardware propio antes de un despliegue definitivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se ha publicado el tamaño del modelo).
- GPU recomendadas: no disponible; la model card solo indica que está diseñado para ejecutarse en el "servidor de alto rendimiento DNX" de Denovarix, sin especificar GPU, memoria ni configuración.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; el despliegue previsto es on-premise sobre hardware DNX e integrado en DNX OS, sin mención de vLLM, llama.cpp, Ollama, TGI ni otros motores.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Desarrollador | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Rix | Denovarix Technologies LLP | Text-to-image | no disponible | no disponible | no disponible | En desarrollo; pesos no publicados |
| Stable Diffusion (familia) | Stability AI | Text-to-image (difusión) | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | Pesos publicados |
| FLUX (familia) | Black Forest Labs | Text-to-image (difusión) | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | Pesos publicados |

No se dispone de datos verificados de parámetros, contexto, rendimiento ni licencia de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no es posible. La diferencia principal observable es de disponibilidad: Rix no publica pesos ni métricas, mientras que las alternativas citadas sí ofrecen modelos descargables. Cualquier comparación de calidad requeriría benchmarks que no se han publicado.

## Limitaciones y advertencias

- El modelo no está disponible: la model card indica explícitamente que está en desarrollo y que los pesos no se publican; no puede evaluarse ni desplegarse hoy.
- Ausencia total de datos técnicos: sin arquitectura, parámetros, resolución, contexto ni proceso de entrenamiento, es imposible estimar requisitos de hardware o calidad de generación.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas establecidas.
- Licencia no especificada: se desconoce si el uso comercial está permitido, restringido o sujeto a acuerdo; la model card remite a contacto directo para licencias y pilotos, lo que sugiere un modelo propietario o de acceso restringido.
- Idioma limitado al inglés: no se declara soporte de castellano ni de otros idiomas, lo que restringe su uso en entornos hispanohablantes sin adaptación.
- Sesgos conocidos: no disponible; al no publicarse la composición del dataset ni el proceso de entrenamiento, no puede evaluarse el sesgo demográfico, cultural o estilístico.
- Riesgo de alucinación visual: no evaluable sin acceso al modelo; en generación de imágenes, los riesgos típicos incluyen fidelidad limitada al prompt, artefactos en texto renderizado y sesgos en la representación de personas.
- Dependencia de hardware propietario: el diseño apunta al servidor DNX y al ecosistema DNX OS, lo que puede limitar la portabilidad a otras infraestructuras.
- Integración con identidad corporativa: la promesa de respetar colores y logotipos no está respaldada por documentación técnica ni ejemplos verificables.
- Madurez del proyecto: repositorio con cero descargas y cero interacciones, creado y actualizado el mismo día (12 de noviembre de 2026), lo que indica un anuncio incipiente sin validación de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Denovarix/Rix
- Sitio web de Denovarix: https://denovarix.com
- DNX OS: https://denovarix.com/dnx-os/
- Programa beta de DNX OS: https://denovarix.com/beta/
- Contacto: hello@denovarix.com
