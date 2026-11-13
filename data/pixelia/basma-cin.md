# pixelia/basma-cin

## Resumen

Basma-CIN es un modelo de visión especializado en la lectura y extracción de datos de cartas nacionales de identidad (CIN) de Marruecos. Lo desarrolla pixelia, un proyecto orientado a despliegues KYC y de verificación de identidad en infraestructura propia (on-premise). El modelo resuelve un problema muy concreto: convertir una imagen de documento de identidad en campos estructurados y validados conforme al estándar ICAO-9303, incluyendo la zona de lectura mecánica (MRZ), sin depender de servicios en la nube de terceros.

Se distribuye como un pipeline `image-to-text` en Hugging Face, con acceso restringido (gated): es necesario aceptar las condiciones de uso en la plataforma antes de descargarlo. Los idiomas declarados son francés y árabe, coherentes con el contexto documental marroquí. La licencia es propietaria (`basma-licence-commerciale`), por lo que su uso comercial está sujeto a los términos del autor y no a una licencia open source.

La relevancia actual del modelo está en el nicho: los sistemas OCR genéricos rinden de forma irregular sobre documentos de identidad con doble escritura (árabe y latina), hologramas, fondos variables y MRZ con dígitos de control. Basma-CIN está entrenado y evaluado específicamente para ese caso de uso, lo que permite plantear flujos de alta automática con revisión humana selectiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | francés (fr), árabe (ar) |
| Licencia | basma-licence-commerciale (propietaria) |
| Formato de pesos | no disponible |
| Tarea (pipeline) | image-to-text |
| Dominio | OCR de cartas nacionales de identidad marroquíes, MRZ ICAO-9303 |
| Acceso | restringido (gated) en Hugging Face |
| Autor | pixelia |
| Fecha de creacion | 2026-11-12 |
| Ultima actualizacion | 2026-11-12 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo (tipo de backbone, número de parámetros, mecanismo de atención o si emplea un decoder generativo frente a un extractor de campos). Tampoco se detallan el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

Lo que sí se declara es el enfoque de producto: el modelo trabaja sobre seis campos críticos de la CIN marroquí y valida la coherencia con la MRZ conforme a ICAO-9303. La evaluación se realizó sobre un conjunto de test congelado de 435 cartas nunca vistas durante el entrenamiento, lo que indica una metodología de validación orientada a producción más que a benchmarks académicos. No hay información sobre innovaciones técnicas concretas (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Extracción de texto e imagen a campos estructurados sobre cartas nacionales de identidad marroquíes.
- Lectura y validación de la zona MRZ según el estándar ICAO-9303, con verificación de dígitos de control.
- Procesamiento de documentos con escritura dual francés/árabe.
- Salida orientada a decisión: el modelo distingue entre cartas aceptadas automáticamente y cartas que requieren relectura humana.
- Capacidad de operar en modo on-premise, sin envío de imágenes a servicios externos.
- Soporte multilingüe limitado a francés y árabe.
- No se declara soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se declara modo thinking, visión general, audio ni otras modalidades fuera del OCR documental.

## Casos de uso

- Onboarding KYC en entidades financieras marroquíes: el modelo extrae los seis campos críticos de la CIN y valida la MRZ, de modo que el sistema puede aceptar automáticamente las cartas con lectura fiable y derivar el resto a revisión manual, reduciendo el tiempo de alta de cliente.
- Verificación de identidad en remoto para fintech y neobancos: al ejecutarse on-premise, las imágenes del documento no salen de la infraestructura del cliente, lo que facilita el cumplimiento de requisitos internos de protección de datos.
- Mostrador físico o kiosco de autoservicio: integrado en un lector de documentos, permite capturar la CIN y prellenar formularios de contratación sin intervención del operador en la mayoría de los casos.
- Cumplimiento normativo y auditoría: la validación ICAO-9303 de la MRZ aporta una comprobación objetiva de integridad del documento que puede registrarse como evidencia en el expediente de cliente.
- Digitalización de archivos de identidad: procesamiento por lotes de imágenes de CIN ya almacenadas para poblar bases de datos estructuradas y detectar registros incompletos o inconsistentes.
- Control de acceso presencial: verificación rápida de la identidad declarada frente al documento presentado en recepciones, oficinas o instalaciones con requisitos de seguridad.
- Integración en plataformas de terceros con requisitos de soberanía de datos: al no depender de una API en la nube, encaja en arquitecturas donde el proveedor de OCR debe residir en el mismo entorno que el sistema de gestión.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| Precisión de las cartas aceptadas | 99,72 % | Test congelado de 435 cartas nunca vistas |
| Cobertura: cartas aceptadas sin relectura | 83 % | Test congelado de 435 cartas nunca vistas |
| Exactitud: cartas completamente correctas | 92,4 % | Test congelado de 435 cartas nunca vistas |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las métricas anteriores son específicas del dominio y no comparables con benchmarks generalistas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el autor no publica tamaño de parámetros ni requisitos de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no puede confirmarse sin conocer el tamaño del modelo.
- Opciones de despliegue: el modelo se presenta para uso on-premise, pero no se detallan servidores de inferencia compatibles (vLLM, TGI, llama.cpp, Ollama u otros).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Enfoque | Idiomas | Licencia | Acceso | Benchmarks publicados |
|---|---|---|---|---|---|
| Basma-CIN (pixelia) | OCR especializado en CIN marroquí y MRZ ICAO-9303 | fr, ar | basma-licence-commerciale (propietaria) | Gated en Hugging Face | Precisión 99,72 %, cobertura 83 %, exactitud 92,4 % sobre test privado de 435 cartas |
| OCR genéricos multimodales (p. ej. familia Qwen-VL, PaddleOCR) | OCR y comprensión documental general | decenas de idiomas | mayoritariamente permisivas | Abierto | Benchmarks generales de OCR y documentos |
| Proveedores cloud de verificación de identidad | KYC gestionado con OCR de documentos | múltiples | servicio comercial | API en la nube | No comparables directamente |

La comparación con alternativas genéricas no es directa: Basma-CIN no publica resultados en benchmarks estándar de OCR documental, y los OCR genéricos no reportan métricas sobre CIN marroquíes con validación MRZ. No se dispone de datos de modelos directamente comparables en este nicho concreto.

## Limitaciones y advertencias

- Dominio muy estrecho: el modelo está diseñado para cartas nacionales de identidad marroquíes; no debe esperarse un rendimiento equivalente sobre otros documentos, otros países u otros formatos.
- Idiomas limitados a francés y árabe; no se declara soporte para otras lenguas presentes en documentos.
- Los benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`), además de calcularse sobre un test privado no reproducible.
- La cobertura del 83 % implica que aproximadamente una de cada seis cartas requiere relectura humana; el flujo de producción debe contemplar esa revisión.
- Licencia propietaria (`basma-licence-commerciale`): el uso comercial está condicionado a los términos del autor y debe revisarse antes de integrarlo en un producto.
- Acceso restringido en Hugging Face: es necesario aceptar las condiciones de la plataforma y del autor para descargar los pesos.
- No se publican detalles de arquitectura, tamaño ni requisitos de hardware, lo que dificulta la planificación de capacidad y la auditoría técnica.
- Riesgo de alucinación en campos: como todo modelo generativo de extracción, puede producir valores plausibles pero incorrectos; la validación de la MRZ mitiga parte del riesgo, pero no sustituye controles adicionales.
- No se documentan sesgos conocidos ni evaluaciones de robustez frente a imágenes degradadas, hologramas, reflejos o documentos falsificados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pixelia/basma-cin
- Perfil del autor: https://huggingface.co/pixelia
- No se han encontrado en la información disponible papers, blogs, repositorios de código ni demos adicionales.
