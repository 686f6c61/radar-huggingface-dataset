# fbaldassarri/tiiuae_Falcon3-3B-Instruct-auto_round-int8-gs64-asym

## Resumen

Este modelo es una cuantización INT8 de `tiiuae/Falcon3-3B-Instruct`, creada por `fbaldassarri` con el fin de permitir la inferencia eficiente en hardware Intel (CPU, iGPU Arc y NPU Core Ultra). El modelo base es un transformer decoder-only de la familia Falcon 3, desarrollado por el Instituto de Innovación Tecnológica (TII), y se presenta como un modelo de chat e instrucciones en inglés. La cuantización, realizada con Intel AutoRound v0.13.1, es de solo pesos (weights-only), con grupo de 64, signo asimétrico y activaciones en `bfloat16`. Según la metadata del repositorio, el archivo safetensors reporta 1.458.306.048 parámetros, si bien el modelo base se publica como "3B". El resultado es un checkpoint listo para cargar con `transformers`, optimizado para entornos sin GPU dedicada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformers decoder-only) |
| Parametros totales | 1.458.306.048 (según metadata del repositorio) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 (solo pesos, group size 64, asimétrica) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (AutoRound / INT8) |

## Arquitectura y entrenamiento

El modelo base, `tiiuae/Falcon3-3B-Instruct`, es un transformer causal (decoder-only) del tipo Llama, entrenado por TII para tareas de instrucción y conversación. Este checkpoint concreto no se reentrenó; en su lugar, se aplicó una cuantización de solo pesos (WoQ) mediante el algoritmo SignRound de Intel AutoRound v0.13.1. El proceso de calibración se ejecutó en CPU con `torch.bfloat16`, usando 128 muestras, 200 iteraciones, longitud de secuencia 512 y tamaño de lote 4. La cuantización es asimétrica con grupo de 64, lo que reduce el tamaño en memoria de los pesos mientras mantiene las activaciones en `bfloat16`. La configuración está pensada para aprovechar las rutas de inferencia de Intel: `intel-extension-for-pytorch`, OpenVINO y NPU AI Boost en procesadores Core Ultra.

## Capacidades

- Generación de texto conversacional en inglés mediante plantilla de chat, tal y como se indica en la model card.
- Inferencia con pesos INT8 y activaciones en `bfloat16`, optimizada para CPU Intel, iGPU Arc y NPU Core Ultra.
- Carga directa con `transformers` (`AutoModelForCausalLM` y `AutoTokenizer`).
- No se proporciona información en la documentación disponible sobre soporte de tool calling, razonamiento multi-step, visión ni audio.

## Casos de uso

- Asistente conversacional local en equipos con CPU Intel sin GPU dedicada: el modelo se puede ejecutar en portátiles o PC de oficina, reduciendo la dependencia de servicios en la nube.
- Chatbot de soporte interno para empresas: gracias a la cuantización INT8, el checkpoint ocupa poco espacio en disco y puede desplegarse en servidores con procesadores Intel y 8 GB de RAM, gestionando consultas frecuentes en inglés.
- Generación de texto en aplicaciones de escritorio: integración en editores o suites ofimáticas para redactar correos, resúmenes y borradores, con respuesta rápida y sin necesidad de aceleración gráfica.
- Procesamiento de documentos confidenciales en local: al no depender de APIs externas, el modelo permite tratar datos sensibles dentro de la propia infraestructura, lo que resulta adecuado para entornos con requisitos de privacidad.
- Prototipado y experimentación en investigación: la receta de cuantización está documentada paso a paso, lo que facilita reproducir el proceso o probar variaciones de grupo y precisión en laboratorios sin GPUs.
- Entornos educativos y demos técnicas: el modelo se puede cargar con unas pocas líneas de código y ejecutar en CPU estándar, siendo útil para ilustrar conceptos de generación de lenguaje en clases o talleres de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser una cuantización INT8 de solo pesos, los pesos ocupan aproximadamente 1,4 GB. Con overhead de activaciones y KV cache, se estima una VRAM de entre 2 y 4 GB para inferencia básica en GPU.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, por ejemplo RTX 3060, Arc A380 o superiores. También se puede ejecutar en iGPU Intel Arc y NPU integradas en procesadores Core Ultra.
- En CPU, se recomienda un mínimo de 8 GB de RAM para una ejecución cómoda, aunque puede funcionar con menos en contextos cortos.
- Opciones de despliegue: `transformers` con PyTorch, `intel-extension-for-pytorch`, OpenVINO y el formato AutoRound. No se indica compatibilidad con llama.cpp ni con GGUF, por lo que no se consideran opciones válidas para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia |
|---|---|---|---|---|
| tiiuae/Falcon3-3B-Instruct (base) | No disponible | bfloat16 | No disponible | Apache 2.0 |
| fbaldassarri/tiiuae_Falcon3-3B-Instruct-auto_round-int8-gs64-asym | 1.458.306.048 (safetensors) | INT8 | No disponible | Apache 2.0 |
| fbaldassarri/tiiuae_Falcon3-3B-Instruct-auto_round-int4-gs64-sym | No disponible | INT4 | No disponible | Apache 2.0 |
| fbaldassarri/tiiuae_Falcon3-3B-Base-auto_round-int4-gs64-sym | No disponible | INT4 | No disponible | Apache 2.0 |

La diferencia principal entre las variantes cuantizadas es el número de bits por peso y el signo de la cuantización. El modelo evaluado usa INT8 asimétrico, mientras que las versiones INT4 emplean 4 bits y configuración simétrica, lo que normalmente reduce aún más el tamaño y acelera la inferencia con una posible pérdida adicional de calidad.

## Limitaciones y advertencias

- Riesgo de alucinación inherente a todo modelo de lenguaje generativo; el modelo puede producir respuestas plausibles pero incorrectas.
- Solo está entrenado y documentado en inglés; el rendimiento en otros idiomas no está garantizado.
- No se han publicado métricas de calidad en la información disponible, por lo que el impacto de la cuantización en la precisión no se puede evaluar a priori.
- La cuantización INT8 de solo pesos puede degradar el resultado en comparación con el checkpoint original en `bfloat16`, sobre todo en tareas de razonamiento complejo.
- La metadata del repositorio reporta un número de parámetros (1.458.306.048) que no coincide con la denominación comercial "3B" del modelo base, lo que puede indicar una diferencia en el conteo o en la composición de los pesos.
- El autor indica que el modelo se ha desarrollado solo con fines de investigación y se distribuye sin garantías de ningún tipo.
- No se han documentado sesgos específicos ni evaluaciones de seguridad en el material proporcionado.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-3B-Instruct-auto_round-int8-gs64-asym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-3B-Instruct
- Variante INT4 del instruct: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-3B-Instruct-auto_round-int4-gs64-sym
- Variante INT4 de la versión base: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-3B-Base-auto_round-int4-gs64-sym
- Repositorio de Intel AutoRound: https://github.com/intel/auto-round
- Pipeline de cuantización mencionado en la model card: https://git.epicdynamic.com/auto-round-pipeline
