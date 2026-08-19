# paulzy/lact-1b-p24-1-explicit-all-one-gtcf-on-soft-z001-step-2048

## Resumen

El modelo `paulzy/lact-1b-p24-1-explicit-all-one-gtcf-on-soft-z001-step-2048` es un checkpoint de pesos de un modelo de lenguaje de aproximadamente 1.095 millones de parámetros (1B) desarrollado por el usuario `paulzy`. Se trata de una liberación archivística de un punto de entrenamiento concreto (paso 2048, semilla 42) dentro de un proyecto de investigación denominado LaCT (Layer-wise Adaptive Computation Time, aunque la arquitectura exacta no se detalla en la información disponible). El modelo incorpora mecanismos de early-exit y routing dinámico, así como test-time training, orientados a mejorar la eficiencia computacional durante la inferencia.

La relevancia de este checkpoint radica en su carácter experimental: documenta una configuración específica con puertas de lectura/actualización explícitas, adaptadores de salida con SiLU y routing binario nativo EXIT/CONTINUE. No se han publicado resultados de evaluación ni métricas de rendimiento, y el repositorio no incluye tokenizer ni estado de optimizador. Está pensado para investigadores que trabajen con la implementación LaCT en el proyecto `yuan_ttt` y necesiten reproducir o continuar experimentos con este punto de control exacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LaCT (Layer-wise Adaptive Computation Time) con early-exit y routing, no se especifican más detalles |
| Parametros totales | 1.095.343.594 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 65.536 (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | research-weights-see-license-notice (license: other) |
| Formato de pesos | safetensors (model.safetensors, 4.381.433.160 bytes, 542 tensores F32) |

## Arquitectura y entrenamiento

La información disponible describe un checkpoint de un modelo LaCT con mecanismos de early-exit y routing. La configuración científica incluye: puertas de lectura/actualización explícitas "all-one" en el prefijo no enrutado, proyección K/V actual, límites de longitud variable corregidos y una ruta de pérdida de entropía cruzada con cabeza congelada. Se emplea un profesor de profundidad completa con detención de gradiente (GTCF-ON), coeficientes de regularización `router_eff_coeff=0.5` y `router_z_coeff=0.001`, y una pérdida de salida temprana con coeficiente `exit_ce_loss_coeff=0.5`. Los adaptadores de salida son de rango 128 con activación SiLU, las características del router se agregan con max-pooling y el routing se realiza mediante argmax binario nativo (EXIT/CONTINUE).

El entrenamiento se realizó con longitud de secuencia de 65.536, acumulación de gradientes de 4, un total de 2.048 pasos, una primera etapa de solo lectura de 512 pasos y semilla 42. El repositorio es exclusivamente de pesos, sin estado de optimizador ni iterador de datos, y no incluye tokenizer (se debe usar el tokenizer de un checkpoint base LaCT compatible, con BOS 128000, EOS 128009 y vocabulario de 128256). Se menciona que el entrenamiento completó correctamente y que se ejecutaron evaluaciones NIAH-1, LongBenchV2 y PG-19, aunque no se publican resultados.

## Capacidades

- Generación de texto: es un modelo de lenguaje con pipeline `text-generation`, capaz de producir texto autogenerado.
- Early-exit y routing dinámico: puede decidir en qué capa detener el cómputo (EXIT) o continuar (CONTINUE), lo que podría reducir la latencia en inferencia.
- Test-time training: el diseño sugiere capacidad de adaptación en tiempo de inferencia, aunque no se documenta cómo se activa.
- Sin información sobre tool calling, agentes, razonamiento multi-paso, capacidades multilingües o visión.

## Casos de uso

No se han documentado casos de uso específicos en la información proporcionada. Dado que se trata de un checkpoint de investigación sin métricas publicadas y con licencia restrictiva, su uso principal es experimental:

- Reproducción de experimentos: investigadores del proyecto LaCT pueden cargar este checkpoint exacto para reproducir los resultados del paso 2048.
- Investigación sobre eficiencia en inferencia: el mecanismo de early-exit y routing permite estudiar el equilibrio entre precisión y coste computacional.
- Desarrollo de técnicas de test-time training: el modelo puede servir como base para probar métodos de adaptación en tiempo de inferencia.
- Análisis de comportamiento de routers: los 20 tensores de router y los adaptadores de salida incluidos permiten inspeccionar las decisiones de routing aprendidas.
- Comparación de configuraciones: al ser un checkpoint con configuración explícita, puede compararse con otras variantes del mismo proyecto.
- Extensiones de fine-tuning: aunque la licencia es restrictiva, podría usarse para investigaciones no comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que se completaron las evaluaciones NIAH-1, LongBenchV2 y PG-19, pero no se incluyen resultados numéricos. No se dispone de comparaciones con otros modelos.

## Requisitos de hardware

No se proporcionan requisitos específicos en la información disponible. Como referencia, el archivo de pesos `model.safetensors` ocupa 4,38 GB en FP32, lo que implica:

- VRAM estimada para inferencia en FP32: al menos 5-6 GB solo para los pesos, más memoria para activaciones y contexto (hasta 65.536 tokens), por lo que se requeriría una GPU con al menos 16-24 GB para un uso práctico.
- GPU recomendadas: no disponible; se sugiere una GPU con al menos 16 GB de VRAM (p. ej., RTX 4080/4090, A100) para manejar el contexto largo.
- No se indican opciones de despliegue (vLLM, llama.cpp, etc.); el modelo usa la librería `transformers` y el formato safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, y al ser un checkpoint de investigación sin métricas publicadas, no es posible establecer comparaciones objetivas.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo se publica bajo `research-weights-see-license-notice`, lo que limita su uso a fines de investigación y prohíbe su uso comercial sin autorización explícita.
- Sin tokenizer incluido: se debe obtener de un checkpoint base compatible, lo que añade un paso adicional para su uso.
- Sin resultados de evaluación publicados: no hay garantía de calidad o rendimiento; el modelo puede presentar alucinaciones o errores no documentados.
- Checkpoint experimental: es un punto intermedio de entrenamiento (paso 2048 de un proceso mayor) y no representa un modelo final pulido.
- Sesgos y riesgos de seguridad: no se ha evaluado el modelo para sesgos, toxicidad o seguridad; no debe usarse en producción sin una validación exhaustiva.
- Contexto largo: aunque se entrenó con 65.536 tokens, no se ha verificado la calidad de la generación en contextos largos.
- Sin soporte para cuantización: no se proporcionan versiones cuantizadas, lo que limita su despliegue en hardware de gama baja.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/paulzy/lact-1b-p24-1-explicit-all-one-gtcf-on-soft-z001-step-2048
- No se dispone de otros enlaces (papers, blogs, repos de código) en la información proporcionada.
