# CobrIX/CobrIX-1.0-Coder-Flash-33B-A13B-GGUF

## Resumen

CobrIX-1.0-Coder-Flash-33B-A13B es un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) desarrollado por CobrIX, diseñado específicamente como asistente de programación y razonamiento técnico. Se distribuye en formato GGUF cuantizado, listo para usar con llama.cpp y otros motores compatibles. El modelo se construye a partir del modelo denso Qwen 3.5 `empero-ai/Qwythos-9B-v2` y añade cinco expertos especializados mediante fine-tuning, logrando un total de aproximadamente 33 mil millones de parámetros, de los cuales unos 13 mil millones se activan por token gracias al enrutamiento Top-2.

La relevancia de este modelo radica en su enfoque híbrido: combina la base densa de Qwen con un conjunto de expertos afinados para tareas de codificación, ciberseguridad y razonamiento complejo. Su ventana de contexto nativa de hasta 1.048.576 tokens lo hace adecuado para trabajar con repositorios de código extensos o documentación técnica larga. Está orientado a flujos de trabajo interactivos donde un desarrollador humano supervisa las sugerencias del modelo, actuando como copiloto de programación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) personalizada, clase `Qwen35MoEForCausalLM` |
| Parametros totales | 33.113.780.736 (~33B) |
| Parametros activos | ~13B por token |
| Longitud de contexto | 1.048.576 tokens (máximo nativo) |
| Tipos de cuantizacion | Q3_K_M, Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | Portugues, ingles |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizado) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE personalizada basada en la familia Qwen 3.5. Contiene 5 expertos en total, de los cuales se activan 2 por token mediante enrutamiento Top-2, más un experto compartido que permanece activo para todos los tokens. El experto compartido se deriva del MLP del modelo base y utiliza un mecanismo de compuerta sigmoide. Esta configuración permite mantener un coste computacional reducido (13B activos) mientras se aprovecha la capacidad de un modelo de 33B parámetros.

No se dispone de información detallada sobre el proceso de entrenamiento, como el número de tokens utilizados, la composición del dataset o si se aplicaron técnicas de RLHF o DPO. El modelo base es `empero-ai/Qwythos-9B-v2`, un modelo denso de Qwen 3.5, sobre el cual se incorporaron los expertos especializados mediante fine-tuning. La arquitectura está diseñada para inferencia eficiente con llama.cpp, y los pesos se distribuyen ya cuantizados en formato GGUF.

## Capacidades

- Generacion de codigo en multiples lenguajes: Python, JavaScript, TypeScript, React, Next.js, Node.js, backend y frontend.
- Razonamiento tecnico avanzado: descomposicion de problemas, depuracion, refactorizacion y diseno de arquitectura de software.
- Analisis de seguridad: revision de codigo orientada a seguridad, analisis de vulnerabilidades, programacion segura y scripting de seguridad.
- Soporte para automatizacion y DevOps: scripts de automatizacion, integracion con pipelines y tareas de infraestructura.
- Razonamiento multi-paso y resolucion de problemas complejos, adecuado para uso como copiloto interactivo.
- Capacidad multilingue limitada a portugues e ingles, con enfoque principal en codigo y documentacion tecnica.
- Ventana de contexto extensa (hasta 1M tokens) que permite procesar repositorios completos o documentacion larga.

## Casos de uso

- Asistente de programacion en tiempo real: el modelo puede integrarse en editores de codigo o entornos de desarrollo para sugerir fragmentos, completar funciones y detectar errores mientras el desarrollador escribe, gracias a su baja latencia con 13B parametros activos.
- Revision de codigo automatizada: con su capacidad de analisis de seguridad, puede revisar pull requests en busca de vulnerabilidades comunes, malas practicas o problemas de rendimiento, actuando como un primer filtro antes de la revision humana.
- Generacion de documentacion tecnica: dada su ventana de contexto de 1M tokens, puede analizar un proyecto completo y generar documentacion coherente en ingles o portugues, incluyendo comentarios de API y guias de uso.
- Depuracion asistida: el modelo puede recibir logs, trazas de pila y fragmentos de codigo para sugerir causas raiz y posibles soluciones, acelerando el ciclo de depuracion en entornos de desarrollo.
- Automatizacion de tareas DevOps: puede generar scripts de despliegue, configuraciones de CI/CD o comandos de infraestructura, y explicar su funcionamiento, facilitando la adopcion de practicas de automatizacion.
- Formacion y aprendizaje de programacion: al estar entrenado en codigo y razonamiento tecnico, puede actuar como tutor interactivo explicando conceptos, mostrando ejemplos y resolviendo dudas en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El tamaño del archivo GGUF depende de la cuantizacion. El repositorio completo ocupa 95.2 GB, pero cada archivo individual no tiene un tamaño listado. Para Q4_K_M, se estima un tamaño de aproximadamente 20-25 GB basado en los 33B parametros totales y ~4.8 bpw.
- Para cargar el modelo completo en GPU con Q4_K_M, se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A5000). Con Q3_K_M, podria caber en 16 GB, aunque con menor calidad.
- En sistemas con VRAM limitada, se puede usar offloading a CPU mediante llama.cpp, lo que permite ejecutar el modelo con memoria RAM adicional, aunque con menor velocidad.
- El uso de la ventana de contexto maxima (1M tokens) requiere una cantidad significativa de memoria adicional (KV cache), por lo que en la practica se recomienda reducir el contexto a 4K-32K tokens para uso interactivo.
- Opciones de despliegue: llama.cpp, LM Studio, llama-cpp-python, y cualquier runtime compatible con GGUF. No se menciona soporte para vLLM o TGI en la informacion disponible.
- La latencia y el throughput no estan especificados, pero al tener solo 13B parametros activos, se espera un rendimiento superior al de un modelo denso de 33B en hardware similar.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con otros modelos de la misma categoria. La model card no proporciona datos de rendimiento ni referencias a modelos comparables.

## Limitaciones y advertencias

- El modelo esta entrenado principalmente en codigo y razonamiento tecnico, por lo que su rendimiento en tareas generales de lenguaje o conocimiento factual puede ser limitado.
- Solo soporta portugues e ingles; no se garantiza un buen comportamiento en otros idiomas.
- No se han publicado evaluaciones de sesgos o alucinaciones. Como cualquier modelo de lenguaje, puede generar codigo incorrecto o inseguro, por lo que se recomienda supervisión humana en entornos de produccion.
- La ventana de contexto de 1M tokens es teorica; en la practica, el uso de contextos muy largos requiere mucha memoria y puede degradar el rendimiento.
- La licencia MIT permite uso comercial y modificacion, pero el modelo base (Qwen 3.5) puede tener sus propias restricciones; se debe verificar la licencia del modelo base original.
- El modelo se distribuye solo en formato GGUF cuantizado; no se proporcionan pesos en safetensors ni otros formatos, lo que limita su uso con frameworks que no soporten GGUF.
- Al ser un modelo relativamente nuevo (creado en agosto de 2026) y con cero descargas, su fiabilidad y soporte comunitario aun no estan establecidos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/CobrIX/CobrIX-1.0-Coder-Flash-33B-A13B-GGUF
- Modelo base: https://huggingface.co/empero-ai/Qwythos-9B-v2
