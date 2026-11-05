# diablomike20/Qwen-Image-2.1-Turbo-Uncensored-GGUF

## Resumen

Qwen-Image-2.1-Turbo-Uncensored-GGUF es un paquete de pesos en formato GGUF para la generación y edición de imágenes, publicado por el usuario diablomike20 en HuggingFace. No se trata de un modelo de lenguaje, sino de un pipeline de difusión completo que combina un modelo de difusión (DiT) Qwen-Image-2.1-Turbo cuantizado a Q4_0, un codificador de texto Qwen3-VL-8B sometido a abliteration (eliminación de rechazos) y cuantizado a Q4_0, y el VAE de Qwen-Image-2.1. El paquete está orientado a su ejecución en la NPU de plataformas Snapdragon mediante stable-diffusion.cpp, con un parche de graph cut específico.

El modelo base Qwen-Image-2.1-Turbo pertenece a la familia Qwen de Alibaba y se distribuye bajo la Qwen Research License, que prohíbe explícitamente el uso comercial. La modificación "uncensored" proviene del codificador de texto abliterado de AtomicChat (Qwen3-VL-8B, Apache 2.0), mientras que el DiT es el Turbo original. El recuento de parámetros reportado en safetensors es de 7.115.124.736.

Este repositorio es un espejo de conveniencia creado para que las aplicaciones Rüya y Esin puedan acceder a los archivos aunque los repositorios de origen se eliminen o se oculten. Con cero descargas y cero likes en el momento de la consulta, su relevancia es acotada: resulta útil para desarrolladores que trabajen en inferencia de difusión sobre NPU Snapdragon y necesiten una versión sin censura del codificador de texto, pero no para uso comercial ni para despliegues generales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusión: DiT Qwen-Image-2.1-Turbo (Q4_0) + codificador de texto Qwen3-VL-8B abliterado (Q4_0) + VAE Qwen-Image-2.1 (BF16) |
| Parametros totales | 7.115.124.736 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (DiT y codificador de texto), F16 (mmproj), BF16 (VAE) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (otros términos; uso no comercial, solo investigación y evaluación) |
| Formato de pesos | GGUF (diffusion_model.gguf, llm.gguf, mmproj.gguf) y safetensors (vae.safetensors) |

## Arquitectura y entrenamiento

El paquete no entrena ningún modelo nuevo: reempaqueta y recuantiza componentes existentes. El componente principal es el DiT de Qwen-Image-2.1-Turbo, tomado del repositorio Abiray/Qwen-Image-2.1-Turbo-GGUF y conservado en su cuantización Q4_0 original. El codificador de texto es un Qwen3-VL-8B al que AtomicChat aplicó abliteration para eliminar los comportamientos de rechazo, convertido de Q8_0 a Q4_0 y de BF16 a F16 en el caso del proyector multimodal (mmproj.gguf), que habilita la edición de imágenes. El VAE proviene de Comfy-Org/Qwen-Image-2.1 en BF16.

La innovación técnica del paquete es la adaptación a NPU: requiere un parche de graph cut sobre stable-diffusion.cpp (denominado dit-qwen21-cut.patch, atribuido a Rüya/Esin) para poder ejecutarse en la NPU de Snapdragon. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre si el modelo Turbo original empleó RLHF, DPO u otras técnicas de alineación. La licencia Qwen Research se incluye en el archivo LICENSE y las atribuciones obligatorias en NOTICE.

## Capacidades

- Generación de imágenes a partir de descripciones textuales mediante el pipeline DiT más codificador de texto.
- Edición de imágenes guiada por texto, gracias al componente mmproj.gguf (proyector visual F16) del codificador Qwen3-VL-8B.
- Generación sin filtros de rechazo en el codificador de texto, fruto de la abliteration aplicada por AtomicChat.
- Ejecución en NPU de Snapdragon mediante stable-diffusion.cpp con el parche de graph cut.
- Inferencia en CPU/GPU mediante stable-diffusion.cpp en formato GGUF.
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-paso ni capacidades de audio.

## Casos de uso

- Investigación sobre alineación y censura en modelos generativos: el codificador abliterado permite estudiar cómo afecta la eliminación de rechazos a la fidelidad de las imágenes generadas frente al modelo original, en un entorno controlado de evaluación.
- Generación de imágenes en dispositivos Snapdragon: el paquete está específicamente adaptado para ejecutarse en la NPU de estas plataformas con stable-diffusion.cpp, lo que permite prototipar generación de imágenes en hardware móvil o de borde.
- Edición de imágenes local con texto: el mmproj.gguf habilita flujos de edición guiada por instrucciones sin depender de servicios en la nube, útil para pruebas de concepto en investigación.
- Evaluación comparativa de cuantizaciones: al incluir DiT en Q4_0 y codificador en Q4_0, sirve para medir la degradación de calidad frente a versiones Q8_0 o BF16 en pipelines de difusión.
- Reproducibilidad de experimentos: al ser un espejo con versiones fijadas (commits indicados en la tabla de archivos), facilita replicar resultados aunque los repositorios originales desaparezcan.
- Desarrollo de herramientas para stable-diffusion.cpp: el parche de graph cut y la estructura de archivos sirven como referencia para integrar pipelines de difusión en NPU dentro de proyectos de código abierto.
- Docencia sobre licencias de modelos: el contraste entre la licencia Qwen Research del DiT y la Apache 2.0 del codificador constituye un caso práctico de cumplimiento normativo en modelos compuestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio ocupa 10,5 GB, por lo que se necesita espacio en disco y memoria suficiente para cargar el DiT Q4_0, el codificador Q4_0 y el VAE BF16 de forma simultánea.
- GPU recomendadas: no disponible. El destino declarado es la NPU de Snapdragon; para CPU/GPU se asume compatibilidad con stable-diffusion.cpp, sin cifras publicadas.
- Compatibilidad con GPU de consumo: no confirmada; la cuantización Q4_0 sugiere que podría caber en GPU de consumo con suficiente VRAM, pero no hay datos verificados.
- Opciones de despliegue: stable-diffusion.cpp (con el parche dit-qwen21-cut.patch para NPU Snapdragon). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no están orientados a pipelines de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Turbo-Uncensored-GGUF (este) | 7.115.124.736 | no disponible | GGUF + safetensors | qwen-research (no comercial) | HuggingFace, 0 descargas |
| Abiray/Qwen-Image-2.1-Turbo-GGUF | no disponible | no disponible | GGUF | qwen-research | HuggingFace |
| AtomicChat/Qwen-Image-2.1-Turbo-Uncensored-GGUF | no disponible | no disponible | GGUF | mixta (DiT qwen-research, codificador Apache 2.0) | HuggingFace |
| Comfy-Org/Qwen-Image-2.1 | no disponible | no disponible | safetensors | no disponible | HuggingFace |

## Limitaciones y advertencias

- Licencia qwen-research: prohíbe el uso comercial; solo se permite investigación y evaluación. Cualquier despliegue productivo o comercial infringe los términos.
- Modelo compuesto con licencias heterogéneas: el DiT es qwen-research y el codificador de texto es Apache 2.0; es necesario cumplir ambas y conservar los archivos LICENSE y NOTICE.
- La abliteration del codificador de texto elimina los rechazos, lo que puede producir contenido inapropiado, ofensivo o no seguro; no hay filtros documentados.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir imágenes incoherentes, con artefactos o que no reflejen fielmente la instrucción, especialmente en Q4_0.
- La cuantización Q4_0 del DiT y del codificador puede degradar la calidad frente a Q8_0 o BF16; no se han publicado métricas de dicha degradación.
- Dependencia de un parche no oficial de stable-diffusion.cpp para NPU Snapdragon; sin él, la ejecución en NPU no es posible.
- Repositorio espejo con cero descargas y sin pipeline declarado: no hay validación comunitaria ni soporte del autor original.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe uniforme en las instrucciones de texto.
- Fecha de creación futura (2026-11-05) en los metadatos, lo que puede indicar inconsistencias en el registro del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/diablomike20/Qwen-Image-2.1-Turbo-Uncensored-GGUF
- DiT base: https://huggingface.co/Abiray/Qwen-Image-2.1-Turbo-GGUF
- Codificador de texto abliterado: https://huggingface.co/AtomicChat/Qwen-Image-2.1-Turbo-Uncensored-GGUF
- VAE: https://huggingface.co/Comfy-Org/Qwen-Image-2.1
- Licencia Qwen Research: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Perfil del autor del parche (Rüya/Esin): https://huggingface.co/matrixportalx
