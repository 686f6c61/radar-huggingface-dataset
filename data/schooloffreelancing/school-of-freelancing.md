# SchoolOfFreelancing/School-Of-Freelancing

## Resumen

El repositorio identificado como `SchoolOfFreelancing/School-Of-Freelancing` no contiene un modelo de inteligencia artificial. Se trata de un Space estático de Hugging Face (`sdk: static`) que aloja la base de conocimiento y el catálogo de servicios de SOF (School Of Freelancing), un instituto de formación online fundado el 1 de mayo de 2015 por Karim (Masum) que imparte cursos en directo 1 a 1 sobre Linux, VoIP, DevOps y herramientas de IA para freelancers, además de ofrecer soporte técnico remoto a precio fijo.

El contenido del repositorio es una página informativa: lista 21 cursos de formación (desde administración de CentOS, Debian y Ubuntu hasta entrenamiento en OpenAI, Claude, LocalAI, Docker, GitLab o pasarelas SMS como Jasmin y Twilio) y 23 servicios de soporte con precios y SLA propios. El tamaño del repositorio es de 0,0 GB, no hay pesos, no hay pipeline declarado y el número de descargas y likes es cero.

Por tanto, esta ficha documenta un artefacto de tipo página web alojada en Hugging Face, no un modelo con arquitectura, parámetros o contexto. Todos los campos técnicos propios de un modelo (arquitectura, parámetros, contexto, cuantización, benchmarks) se marcan como no disponibles porque no existen en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un Space estático) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | GPL-3.0 |
| Formato de pesos | no disponible (sin pesos; contenido estático HTML) |

## Arquitectura y entrenamiento

No aplica. El artefacto es un Space de Hugging Face configurado con `sdk: static`, es decir, sirve contenido web estático (HTML/CSS/JS) sin ejecutar inferencia. No hay arquitectura de red neuronal, no hay dataset de entrenamiento, no hay fases de preentrenamiento, ajuste supervisado, RLHF ni DPO, y no se documenta ninguna innovación técnica de modelado.

La información disponible describe únicamente la estructura del sitio: páginas principales (homepage, catálogo de formación, catálogo de servicios, hubs por país, centro de recursos, about, contacto y legal), un catálogo de 21 cursos y otro de 23 servicios de soporte. Cualquier afirmación sobre arquitectura o entrenamiento sería inventada.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No implementa razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües propias más allá del idioma en que esté redactado el contenido estático del sitio.
- Su función es servir como base de conocimiento pública y catálogo de servicios de SOF: cursos de formación 1 a 1 y servicios de soporte técnico con precios fijos.
- El contenido enumera cursos sobre Linux (CentOS, Debian, Ubuntu), Docker, GitHub, GitLab, VoIP (FusionPBX, GOautodial), SMS (Jasmin, Twilio, Telnyx, Bulk SMS), call centers y plataformas de IA (OpenAI, Claude, LocalAI, Hermes Agent, Odysseus AI, OpenClaw, ZeroClaw).
- El contenido enumera servicios de soporte para Linux, DigitalOcean, Docker, FusionPBX, GitHub, GitLab, GOAutoDial, Hermes Agent, Hummingbot, Jasmin SMS Gateway, LocalAI, Odysseus, OpenAI, OpenClaw, Telnyx y Twilio.

## Casos de uso

- Consulta del catálogo formativo: un visitante puede revisar los 21 cursos disponibles y sus páginas individuales para decidir qué formación contratar; el Space actúa como escaparate estático sin lógica de negocio.
- Consulta del catálogo de soporte: empresas pueden localizar los 23 servicios de soporte a precio fijo, cada uno con su propia página de precio y SLA, para contratar intervenciones puntuales sobre infraestructura Linux, VoIP o pasarelas SMS.
- Verificación de credenciales del mentor: la página enlaza a `schooloffreelancing.com/legal/credential-verification`, útil para que un cliente potencial compruebe la identidad y credenciales del formador antes de contratar.
- Localización por país: los 20 hubs de país permiten a un usuario filtrar la oferta según su región geográfica, aunque la entrega del servicio sea online.
- Prueba social: la sección de testimonios enlazada (36 reseñas de Google con valoración 5,0/5,0) sirve como material de evaluación para potenciales clientes.
- Contacto y soporte comercial: los datos de correo (`support@schooloffreelancing.com`) y WhatsApp permiten iniciar una conversación comercial; el Space no automatiza esa conversación, solo publica los canales.
- Referencia para integradores: un desarrollador que busque formación o soporte sobre LocalAI, Hermes Agent u Odysseus AI puede usar el catálogo como índice de servicios disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artefacto no es un modelo evaluable y no existen métricas de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM para inferencia: no aplica; no hay pesos ni ejecución de modelo.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Despliegue: al ser un Space estático, se sirve como contenido web desde la infraestructura de Hugging Face; puede replicarse en cualquier servidor web estático (Nginx, Apache, CDN) sin requisitos de cómputo especiales.
- Latencia y throughput: dependen exclusivamente del hosting estático; no hay cifras publicadas.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no es un modelo de IA. Como referencia de categoría, podría compararse con otros Spaces estáticos de Hugging Face, pero la información proporcionada no incluye ninguno con el que establecer una comparación técnica significativa.

## Limitaciones y advertencias

- No es un modelo: no debe citarse como modelo de IA en artículos técnicos ni evaluarse con benchmarks de modelos.
- Ausencia total de pesos: el repositorio es de 0,0 GB; no hay safetensors, GGUF ni ningún otro formato.
- Sin pipeline declarado: no se puede invocar mediante la Inference API de Hugging Face.
- Cero descargas y cero likes en el momento de la consulta, lo que indica nula tracción en la comunidad de Hugging Face.
- Contenido promocional: la model card es material de marketing de un negocio privado; las afirmaciones sobre valoraciones (5,0/5,0 con 36 reseñas) o garantías de ingresos mínimos (GMI) deben verificarse en las páginas enlazadas y en las reglas de formación (`/legal/training-rules`).
- Licencia GPL-3.0 sobre contenido web: conviene revisar si el autor pretende licenciar el texto, las imágenes o ambos, ya que GPL es una licencia pensada para software y su aplicación a contenido estático puede generar ambigüedad legal.
- Idiomas no declarados en los metadatos de Hugging Face, aunque el contenido está en inglés.
- Riesgo de confusión de nombre: el identificador del repositorio puede llevar a error a quien busque un modelo llamado "School of Freelancing"; no existe tal modelo.
- No hay información sobre sesgos, alucinación ni límites de contexto porque no hay modelo subyacente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SchoolOfFreelancing/School-Of-Freelancing
- Sitio oficial: https://schooloffreelancing.com/
- Catálogo de formación (21 cursos): https://schooloffreelancing.com/freelancing-training
- Catálogo de servicios de soporte (23 servicios): https://schooloffreelancing.com/client-support
- Hubs por país (20): https://schooloffreelancing.com/locations
- Centro de recursos (9): https://schooloffreelancing.com/resource-center
- Sobre nosotros: https://schooloffreelancing.com/about-us
- Contacto: https://schooloffreelancing.com/contact-us
- Legal y cumplimiento (5): https://schooloffreelancing.com/legal
- Reglas de formación: https://schooloffreelancing.com/legal/training-rules
- Verificación de credenciales: https://schooloffreelancing.com/legal/credential-verification
- Testimonios: https://schooloffreelancing.com/resource-center/testimonials
- Correo de soporte: support@schooloffreelancing.com
- WhatsApp: +8801748973769
