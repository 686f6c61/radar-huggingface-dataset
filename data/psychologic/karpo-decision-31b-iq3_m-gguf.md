# PsychoLogic/karpo-decision-31B-IQ3_M-GGUF

## Resumen

karpo-decision-31B-IQ3_M-GGUF es una cuantización GGUF de tipo IQ3_M del modelo MachinePulseAI/karpo-decision-31B, publicada por el usuario PsychoLogic. El modelo base es un transformer de 32.106.631.740 parámetros (aproximadamente 32,1 mil millones) especializado en toma de decisiones, según los tags del repositorio. Esta ficha describe la versión cuantizada, que ocupa 15,0 GB en disco y está pensada explícitamente para ejecutarse en GPUs de 16 GB de VRAM.

La relevancia de esta publicación es doble. Por un lado, permite servir un modelo de 32B en hardware de consumo, algo imposible con los pesos originales en precisión completa. Por otro, la model card advierte de una particularidad técnica crítica: el modelo base entrena las capas de atención global como bidireccionales y las capas de atención de ventana deslizante (SWA) como causales dentro de la ventana, lo que invierte el comportamiento por defecto de llama.cpp para Gemma 4. Sin el parche proporcionado por el autor, el modelo produce resultados incorrectos de forma silenciosa.

La licencia es la MachinePulse Community License, con requisitos de atribución («Powered by karpo-decision») para uso de terceros en producción. El repositorio incluye el texto Apache-2.0 de la base Gemma 4 subyacente, lo que sugiere que el modelo base deriva de esa familia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con capas de atención global y capas de atención de ventana deslizante (SWA), con semántica de atención no causal en las globales (según la model card) |
| Parámetros totales | 32.106.631.740 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la medición de referencia se hizo con `-c 4096`) |
| Tipos de cuantización | IQ3_M (única disponible en este repo) |
| Idiomas soportados | no disponible |
| Licencia | machinepulse-community (MachinePulse Community License), con texto Apache-2.0 de Gemma 4 incluido |
| Formato de pesos | GGUF (15,0 GB; 13,4 GiB de pesos según `llama-quantize --dry-run`) |

## Arquitectura y entrenamiento

El modelo base es un transformer de 32,1 mil millones de parámetros con una mezcla de capas de atención global y capas de atención de ventana deslizante. La innovación destacable, y el principal riesgo operativo, es que las capas globales se entrenan con atención bidireccional mientras que las capas SWA son causales dentro de su ventana. Esto es el inverso del comportamiento por defecto de llama.cpp para Gemma 4, que asume `SWA_ONLY`. El autor añade un parche que introduce `LLAMA_NON_CAUSAL_TYPE_GLOBAL` y la clave GGUF `gemma4.attention.non_causal_type` (valor 3 en este fichero); las compilaciones estándar de llama.cpp ignoran esa clave y producen semántica de atención incorrecta sin avisar.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. La cuantización se generó con `convert_hf_to_gguf.py` y `llama-quantize` de llama.cpp (commit master `0a731cc`) más los parches del conversor incluidos en `patches/`. El autor reporta una validación empírica: 7.854 llamadas reales de decisión (muestra con paso 10 de 78.534, prompts idénticos byte a byte, lectura de opción en un solo forward) sobre una ventana de trading de 14 días, con 0 errores en una RTX 5060 Ti de 16 GB.

## Capacidades

- Generación de texto conversacional (tag `conversational` en el repositorio).
- Toma de decisiones estructurada: el protocolo de decisión del modelo base consiste en leer una opción o slot en un único forward, según la descripción de la validación.
- Razonamiento aplicado a dominios operativos: la validación se hizo con prompts de decisión de trading en producción.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Señalización de decisiones en trading algorítmico: el modelo se validó con 7.854 llamadas de decisión reales de una ventana de 14 días, con lectura de opción en un solo forward, lo que encaja en pipelines de baja latencia que necesitan una decisión por evento de mercado.
- Clasificación y enrutamiento de decisiones con formato fijo: el patrón de «slot/option readout» permite usarlo como clasificador de decisiones acotadas en backends de negocio, siempre que el prompt y las opciones se construyan de forma determinista.
- Evaluación en hardware de consumo: con 15,0 GB de fichero y 13,4 GiB de pesos, cabe en una GPU de 16 GB (el autor lo sirvió a 14.740/15.846 MiB con caché KV q8_0), lo que permite prototipar y evaluar sin GPUs de datacenter.
- Despliegue local con llama.cpp en Docker: el autor documenta el stack exacto (nvidia/cuda:12.8.1, `-c 4096 -b 4096 -ub 4096 --parallel 1`), lo que facilita reproducir el entorno en estaciones de trabajo con una sola GPU.
- Investigación sobre semántica de atención híbrida: el modelo y su parche son un caso de estudio útil para quienes trabajen con atención bidireccional en capas globales combinada con SWA causal.
- Sustitución de modelos mayores en entornos con restricción de VRAM: para tareas de decisión acotadas donde un 32B cuantizado a IQ3_M sea suficiente, evita el coste de servir los pesos originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado es la validación funcional del autor: 7.854 llamadas de decisión reproducidas byte a byte sobre una ventana de trading de 14 días, con 0 errores, en una RTX 5060 Ti de 16 GB con llama.cpp en Docker y caché KV q8_0.

## Requisitos de hardware

- VRAM estimada: 13,4 GiB de pesos más caché KV; el autor reporta 14.740 MiB en uso sobre 15.846 MiB disponibles con contexto de 4096 y KV q8_0.
- GPU objetivo: tarjetas de 16 GB. El autor lo midió en una RTX 5060 Ti (15.846 MiB).
- Cabe en GPU de consumo: sí, en modelos de 16 GB o más. No cabe en GPUs de 8 o 12 GB con este fichero.
- Opciones de despliegue: llama.cpp (obligatorio aplicar los parches de `patches/` con `git am patches/*.patch`); el autor lo ejecutó en Docker con nvidia/cuda:12.8.1. vLLM, TGI u Ollama no se mencionan y, dado el requisito de atención no causal, no puede asumirse compatibilidad.
- Latencia y throughput: no disponibles; solo se documenta la configuración de serving (`-c 4096 -b 4096 -ub 4096 --parallel 1`, un modelo residente).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos comparables, por lo que no es posible establecer una comparación rigurosa de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Requisito de parche crítico: sin el parche de llama.cpp incluido en el repositorio, las compilaciones estándar ignoran `gemma4.attention.non_causal_type` y producen semántica de atención incorrecta de forma silenciosa. No es un fallo visible: los resultados serán erróneos sin aviso.
- Licencia restrictiva: MachinePulse Community License, no Apache-2.0 ni MIT. Exige atribución («Powered by karpo-decision») para uso de terceros en producción; el uso interno y de evaluación está exento. La redistribución de esta cuantización está permitida bajo la sección 1 de dicha licencia.
- Idiomas no declarados: no hay información sobre cobertura lingüística; no debe asumirse buen rendimiento en castellano ni en otros idiomas sin evaluarlo.
- Contexto no declarado: la única medición usa 4096 tokens; se desconoce la ventana máxima real del modelo base.
- Cuantización IQ3_M: es una cuantización agresiva de 3 bits; puede degradar la precisión frente a los pesos originales, especialmente en tareas sensibles al detalle. La validación del autor es funcional (0 errores de ejecución), no una evaluación de calidad frente al modelo base.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; no se documentan evaluaciones de sesgo ni de robustez.
- Madurez: el repositorio tiene 9 descargas y 0 likes, y el modelo base no incluye benchmarks publicados en la información disponible; trátese como un artefacto en fase temprana de validación.
- Dependencia del toolchain: requiere el commit `0a731cc` de llama.cpp más los parches del conversor; otras versiones pueden no cargar o interpretar mal el fichero.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/PsychoLogic/karpo-decision-31B-IQ3_M-GGUF
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Licencia: LICENSE dentro del repositorio (MachinePulse Community License)
- Parches del toolchain: directorio `patches/` del repositorio (Apache-2.0, basados en llama.cpp)
- Sumas de verificación: `SHA256SUMS` en el repositorio
