# neosantara/Zeroed-50M-Agent-V3

## Resumen

Zeroed-50M-Agent-V3 es un modelo de lenguaje pequeño (50 millones de parámetros) orientado a tareas de agente de codificación, desarrollado por el equipo Neosantara. Se trata de la tercera versión de una serie de modelos entrenados desde cero, con un enfoque específico en la generación de código y la resolución de problemas de ingeniería de software (SWE). El modelo está diseñado para operar con ventanas de contexto largas, gracias a una base RoPE de 500 000 que permite extrapolar hasta 100 000 tokens, y ha sido ajustado mediante supervisión estricta (SFT) con trayectorias verificadas de agentes de software.

La relevancia de este modelo radica en su tamaño reducido, que lo hace viable para entornos con recursos limitados, como GPUs de consumo o incluso CPU, manteniendo capacidades específicas para tareas de codificación. Su licencia MIT permite uso comercial sin restricciones, y su entrenamiento en Google Colab con una T4 demuestra que es posible obtener resultados útiles con infraestructura modesta. Aunque no se publican benchmarks formales, la propuesta de valor se centra en la eficiencia y la especialización en el dominio del código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 50 millones (inferido del nombre) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 100 000 tokens (extrapolacion RoPE, base 500 000) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La arquitectura concreta no se especifica en la informacion disponible, pero por el tamano y el enfoque se trata probablemente de un transformer decoder-only estandar. El entrenamiento se realizo desde cero (from-scratch) sobre el checkpoint de la version anterior, Zeroed-50M-Agent-V2, con un total de 1500 pasos de optimizacion y una loss final de 0.3422. El ajuste fino supervisado (SFT) se filtro estrictamente para incluir solo trayectorias de SWE verificadas (procedentes de `nvidia/SWE-Zero-openhands-trajectories` y `nebius/SWE-agent-trajectories` con target=True) y instrucciones de Python limpias de `CodeAlpaca-20k`. Ademas, se aplico una base RoPE de 500 000 (estandar de LLaMA-3) para permitir extrapolacion de contexto largo, y la decodificacion se evaluo con penalizacion de repeticion de 1.2 y Top-K de 20.

## Capacidades

- Generacion de codigo en Python y otros lenguajes, con enfasis en instrucciones limpias y verificadas.
- Resolucion de problemas de ingenieria de software (SWE) a partir de trayectorias de agentes, lo que sugiere capacidad para razonamiento multi-paso en tareas de codificacion.
- Extrapolacion de contexto hasta 100 000 tokens gracias a la base RoPE ampliada, util para repositorios grandes o conversaciones largas.
- Generacion de texto en ingles, con soporte para instrucciones de codigo y posiblemente tool calling (aunque no se menciona explicitamente, es un modelo orientado a agentes).
- Decodificacion con penalizacion de repeticion y Top-K, lo que reduce la generacion de texto repetitivo.

## Casos de uso

- Autocompletado de codigo en editores: el modelo puede sugerir fragmentos de codigo Python en tiempo real, aprovechando su entrenamiento en CodeAlpaca-20k y su tamano reducido para ejecutarse localmente en maquinas de desarrollo.
- Asistente de codigo para entornos con recursos limitados: al ser de solo 50M de parametros, puede desplegarse en una Raspberry Pi o en un portatil sin GPU, ofreciendo sugerencias basicas de codigo y depuracion.
- Generacion de scripts de automatizacion: dado su entrenamiento en trayectorias de agentes SWE, puede generar scripts para tareas repetitivas como procesamiento de archivos, scraping o integracion con APIs.
- Educacion y aprendizaje de programacion: como modelo pequeno y de licencia MIT, puede integrarse en plataformas educativas para explicar conceptos de codigo o generar ejemplos sencillos.
- Prototipado rapido de agentes de codigo: los desarrolladores pueden usarlo como base para experimentar con agentes autonomos que resuelven issues de GitHub, gracias a su SFT con trayectorias verificadas.
- Filtrado y clasificacion de codigo: su capacidad para entender instrucciones de codigo permite usarlo en pipelines de revision de codigo, detectando patrones comunes o generando resumenes de cambios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Por tanto, no es posible evaluar su rendimiento cuantitativo en tareas estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 50M de parametros en FP32 ocupa aproximadamente 200 MB, y en cuantizacion de 8 bits unos 50 MB. Cabe en cualquier GPU moderna, incluso en iGPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluyendo GTX 1050, RTX 2060, o incluso la T4 de Colab usada en el entrenamiento.
- Compatibilidad con GPU de consumo: si, es totalmente viable en GPUs de gama baja y media.
- Opciones de despliegue: al ser un modelo pequeno, puede ejecutarse con llama.cpp (formato GGUF si se convierte), Ollama, o directamente con transformers de HuggingFace en CPU. Tambien es compatible con vLLM para inferencia de alto rendimiento, aunque no es necesario.
- Latencia y throughput: no se dispone de datos medidos, pero por el tamano se espera una latencia de milisegundos en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (modelos de 50M especializados en codificacion). Existen modelos como CodeGPT-350M o Salesforce CodeGen-350M, pero no se han encontrado datos de comparacion en la informacion proporcionada. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Tamano muy reducido: con solo 50M de parametros, la capacidad de razonamiento complejo y generacion de codigo avanzado es limitada en comparacion con modelos de cientos de miles de millones.
- Sesgos y alucinaciones: al ser un modelo pequeno entrenado con datos filtrados, puede generar codigo incorrecto o inventar APIs inexistentes, especialmente en contextos largos.
- Idioma: solo soporta ingles, lo que limita su uso en entornos multilingues.
- Contexto extrapolado: aunque la base RoPE permite 100k tokens, el entrenamiento no se realizo con secuencias tan largas, por lo que la calidad puede degradarse en contextos muy extensos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento, lo que dificulta evaluar su idoneidad para produccion.
- Dependencia de datos de entrenamiento: el SFT se baso en trayectorias de SWE y CodeAlpaca, lo que puede limitar su generalizacion a otros dominios de codigo o lenguajes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/neosantara/Zeroed-50M-Agent-V3
- Version anterior (V2): https://huggingface.co/neosantara/Zeroed-50M-Agent
- Documentacion de Neosantara: https://docs.neosantara.xyz/
- Overview de modelos: https://docs.neosantara.xyz/en/models-overview
- Cookbook de Neosantara en GitHub: https://github.com/ujjwal-saahu/agentic-ai-lab/blob/main/cookbook/90_models/neosantara/README.md
- Integracion con Agno: https://docs.agno.com/models/providers/gateways/neosantara/overview
