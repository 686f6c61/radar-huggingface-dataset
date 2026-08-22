# altic-dev/Fluid-1-Mini-2B-MLX-mixed46

## Resumen

Fluid-1-Mini-2B-MLX-mixed46 es un modelo de lenguaje pequeño desarrollado por altic-dev, destinado exclusivamente a la mejora de dictado por voz en las aplicaciones FluidVoice. Se presenta como un checkpoint en formato MLX con una mezcla de cuantización (mixed46) y está derivado de Qwen3.5-2B, aunque los pesos reales en safetensors suman 377.215.296 parámetros, lo que sugiere que se trata de una versión compacta o destilada del modelo original. El modelo está diseñado para realizar tareas de limpieza y post-procesamiento del texto dictado, como formateo inteligente, capitalización contextual y corrección, todo ello ejecutado localmente en el dispositivo.

La licencia es muy restrictiva: solo permite su uso a través de las aplicaciones oficiales FluidVoice, prohibiendo expresamente copiar, redistribuir, modificar, alojar o integrar el modelo en cualquier otro producto. Esto limita enormemente su aplicabilidad fuera del ecosistema FluidVoice, aunque los componentes derivados de Qwen se mantienen bajo Apache 2.0. En el momento de la consulta, el modelo no tiene descargas ni valoraciones en HuggingFace, lo que indica que es una publicación reciente y de nicho.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen3.5-2B) |
| Parámetros totales | 377.215.296 |
| Parámetros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | mixed46 (según nombre), 6-bit en la variante MLX-6bit |
| Idiomas soportados | no disponible |
| Licencia | altic-fluidvoice-apps-only (uso exclusivo en apps FluidVoice) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna del modelo, aunque el nombre sugiere una base Qwen3.5-2B. Se sabe que es un modelo pequeño (377M de parámetros) orientado a tareas de post-procesamiento de dictado, probablemente entrenado con técnicas de afinación fina supervisada o RLHF, pero no se han publicado datos sobre el conjunto de entrenamiento, número de tokens ni el proceso de alineación. El modelo se distribuye en formato MLX, lo que indica que está optimizado para ejecución en macOS mediante el framework MLX de Apple. La variante "mixed46" sugiere una mezcla de cuantización (probablemente 4-bit y 6-bit) para equilibrar tamaño y rendimiento.

## Capacidades

- Mejora del texto dictado: formateo inteligente, corrección de puntuación y capitalización contextual.
- Post-procesamiento de transcripciones de voz: limpieza de errores típicos de reconocimiento de voz.
- Procesamiento local en el dispositivo: no requiere conexión a internet ni servidores externos.
- Integración con FluidDecode y DFlash: componentes del ecosistema FluidVoice para la decodificación y mejora del dictado.
- Restricción de uso: solo puede operar dentro de las aplicaciones FluidVoice oficiales; no hay acceso a sus capacidades de forma independiente.

## Casos de uso

- Dictado de voz en macOS: el modelo se integra en FluidVoice, la aplicación de dictado de código abierto para Mac, para mejorar la precisión del texto resultante.
- Formato automático en documentos: al dictar, el modelo aplica reglas de formato como mayúsculas iniciales, puntuación y estructura de párrafos.
- Corrección de errores de reconocimiento: el modelo corrige errores comunes de STT (Speech-to-Text) como homófonos o palabras mal transcritas.
- Post-procesamiento de transcripciones médicas o legales: aunque no se especifica, el modelo podría ser útil en entornos donde se requiere una transcripción precisa y limpia.
- Accesibilidad: facilita la escritura a personas con movilidad reducida que usan dictado como método principal de entrada.
- Aplicación de notas rápidas: integración en apps de notas que usan FluidVoice para transcribir ideas sin necesidad de teclado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~377M de parámetros, una cuantización 4-bit ocuparía aproximadamente 0.4 GB (377M × 4 bits ≈ 188 MB, más overhead). Con cuantización mixta podría ser algo más, pero cabe en la mayoría de GPUs consumer.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (por ejemplo, RTX 3050, GTX 1660, M1/M2/M3 con MLX) podría ejecutarlo sin problemas.
- En consumer GPU: sí, es muy ligero y puede funcionar en CPU si se usa MLX, aunque la inferencia será más lenta.
- Opciones de despliegue: el formato MLX sugiere que está pensado para ejecutarse con el framework MLX en macOS. No hay indicios de soporte para vLLM, llama.cpp u otros backends.
- Latencia y throughput: no se han publicado datos. Dado su tamaño, se espera una latencia baja en hardware moderno, pero no hay cifras oficiales.

## Comparativa con modelos similares

No hay información pública sobre modelos comparables de la misma categoría (modelos de post-procesamiento de dictado con licencia restrictiva). El modelo es único en su nicho, por lo que no se puede establecer una comparativa directa. Se puede mencionar que comparte base con Qwen3.5-2B, pero no hay datos de rendimiento para comparar.

## Limitaciones y advertencias

- Licencia muy restrictiva: el uso está limitado exclusivamente a aplicaciones FluidVoice oficiales. No se permite copiar, redistribuir, modificar, alojar ni integrar en otros productos. Esto impide su uso en proyectos propios o comerciales fuera del ecosistema.
- Sin datos de sesgos o alucinaciones: no se ha publicado información sobre sesgos, riesgos de alucinación o comportamientos no deseados.
- Sin documentación técnica: no hay paper, detalles de entrenamiento ni especificaciones de contexto o idiomas.
- Dependencia de la plataforma: el formato MLX limita su ejecución a hardware de Apple (macOS) con el framework MLX; no se menciona compatibilidad con otros backends.
- Riesgo de obsolescencia: al ser un modelo de nicho y con restricciones, puede que no reciba actualizaciones o soporte a largo plazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/altic-dev/Fluid-1-Mini-2B-MLX-mixed46
- Modelo MLX-6bit: https://huggingface.co/altic-dev/Fluid-1-Mini-2B-MLX-6bit
- Repositorio del modelo base: https://huggingface.co/altic-dev/fluid-1-mini
- GitHub de FluidVoice: https://github.com/altic-dev/FluidVoice
- Web de FluidVoice: https://altic.dev/fluid
- Términos de licencia: https://huggingface.co/altic-dev/Fluid-1-Mini-2B-MLX-mixed46/blob/main/ALTIC-MODEL-TERMS.md
