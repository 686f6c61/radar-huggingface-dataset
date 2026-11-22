# onocloud/onoai-onyx-2.5-pro-ONNX-WebGPU

## Resumen

OnoAI Onyx 2.5 Pro es un modelo multimodal de tipo image-text-to-text desarrollado por OnoCloud, distribuido en formato ONNX optimizado para ejecución en navegador mediante WebGPU. El modelo se presenta como una solución de inferencia local en el cliente, sin necesidad de servidores intermedios, lo que resulta relevante para escenarios de privacidad de datos y despliegue en entornos con conectividad limitada o requisitos de soberanía tecnológica.

La ficha del repositorio incluye la etiqueta `zatca-phase2`, que sugiere compatibilidad o especialización para los requisitos de facturación electrónica de la autoridad tributaria de Arabia Saudí (ZATCA), lo que apunta a un uso orientado a procesos administrativos y financieros en la región. El modelo declara soporte para inglés y árabe, lo que refuerza esa orientación regional.

El repositorio ocupa 5,8 GB y está sujeto a acceso restringido (gated) bajo la licencia propietaria `onocloud-sovereign-license`. No se han publicado resultados de benchmarks, número de parámetros ni longitud de contexto en la información disponible, por lo que muchos de los datos técnicos habituales deben marcarse como no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text, pesos en ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio se distribuye en formato ONNX; se desconoce si incluye variantes cuantizadas) |
| Idiomas soportados | en, ar |
| Licencia | onocloud-sovereign-license (licencia propietaria, acceso restringido) |
| Formato de pesos | ONNX (optimizado para WebGPU) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo (si es un transformer denso, MoE o híbrido), el número de parámetros, la composición del dataset de entrenamiento ni si se aplicaron técnicas de alineación como RLHF o DPO. La única información estructural disponible es que se distribuye como un grafo ONNX pensado para ejecutarse sobre WebGPU en el navegador, lo que implica que el modelo ha sido exportado y optimizado para inferencia en el cliente.

La etiqueta `zatca-phase2` sugiere que el modelo podría haber sido ajustado o validado para tareas relacionadas con la segunda fase de la normativa de facturación electrónica de ZATCA, aunque no se especifica el alcance de dicho ajuste ni los datos utilizados. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos de caché KV optimizados para WebGPU.

## Capacidades

- Procesamiento multimodal image-text-to-text: acepta imágenes y texto como entrada y genera texto.
- Generación de texto en inglés y árabe.
- Ejecución en navegador mediante WebGPU, sin backend servidor.
- Orientación potencial a tareas de facturación electrónica y cumplimiento ZATCA fase 2 (según etiqueta del repositorio).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de código, matemáticas o visión especializada: no disponibles en la documentación.
- Modo thinking explícito: no disponible.

## Casos de uso

- Validación de facturas electrónicas ZATCA fase 2 en el navegador: el modelo podría integrarse en aplicaciones web de facturación para verificar campos, formatos y contenido de documentos antes de su envío a la autoridad tributaria, aprovechando su ejecución local y su soporte de árabe.
- Extracción de datos de documentos escaneados: al ser image-text-to-text, puede procesar imágenes de facturas, albaranes o formularios y devolver texto estructurado, sin que las imágenes abandonen el dispositivo del usuario.
- Asistencia administrativa bilingüe árabe-inglés: útil en entornos corporativos del Golfo Pérsico donde se requiere alternar entre ambos idiomas en la misma conversación o documento.
- Procesamiento de documentos con privacidad estricta: la inferencia en WebGPU permite tratar imágenes sensibles (nóminas, contratos, identificaciones) sin enviarlas a un servidor externo, lo que facilita el cumplimiento de normativas de protección de datos.
- Aplicaciones web offline-first: el modelo puede empaquetarse en una PWA o aplicación de escritorio basada en navegador para operar en entornos con conectividad intermitente, como sucursales bancarias o puntos de venta.
- Digitalización de archivos históricos: conversión de documentos árabes escaneados a texto editable directamente en el navegador del archivero, con revisión humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 5,8 GB, lo que da una cota inferior orientativa del espacio de almacenamiento necesario, pero no equivale a la VRAM requerida en tiempo de ejecución.
- GPU recomendadas: no disponible. Al ejecutarse sobre WebGPU, requiere un navegador con soporte WebGPU (Chrome/Edge 113+, Safari 18+ en macOS) y una GPU compatible con dicha API.
- Compatibilidad con GPU de consumo: no confirmada. Dependerá del tamaño real del modelo y de la memoria de vídeo disponible; no se especifica.
- Opciones de despliegue: navegador con WebGPU (ONNX Runtime Web u otro runtime compatible con ONNX). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (multimodales image-text-to-text en ONNX/WebGPU con soporte árabe-inglés y orientación ZATCA), ni se dispone de datos de rendimiento para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de descargar los pesos.
- Licencia propietaria: `onocloud-sovereign-license`; no se detallan los términos de uso comercial, redistribución ni modificación, por lo que es imprescindible revisar el texto completo de la licencia antes de cualquier uso en producción.
- Idiomas limitados a inglés y árabe; no se declara soporte de castellano ni de otras lenguas.
- Sin datos públicos de benchmarks, parámetros o contexto: imposible evaluar su calidad frente a alternativas sin pruebas propias.
- Riesgo de alucinación: no cuantificado; como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente crítico en contextos de cumplimiento fiscal.
- Dependencia de WebGPU: la compatibilidad del navegador y de la GPU del usuario condiciona el funcionamiento; entornos sin WebGPU no podrán ejecutarlo.
- Sin documentación sobre sesgos: no se han publicado evaluaciones de sesgo lingüístico, cultural o de género.
- Repositorio sin descargas ni interacciones: no hay evidencia de comunidad, mantenimiento activo ni soporte técnico.
- Uso en producción: se recomienda validación exhaustiva contra los requisitos oficiales de ZATCA antes de automatizar cualquier proceso tributario.

## Enlaces

- Hugging Face: https://huggingface.co/onocloud/onoai-onyx-2.5-pro-ONNX-WebGPU
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
