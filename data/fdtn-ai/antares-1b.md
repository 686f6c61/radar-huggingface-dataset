# fdtn-ai/antares-1b

## Resumen

Antares-1B es un modelo de lenguaje de 1.837 millones de parámetros desarrollado por fdtn-ai (iniciativa vinculada a Cisco) para la localización agéntica de vulnerabilidades en código fuente. Se basa en el modelo IBM Granite 4.0-1B y ha sido ajustado mediante un pipeline de dos etapas que combina supervisión fina sobre razonamiento de ciberseguridad y exploración de repositorios, seguida de aprendizaje por refuerzo con recompensas verificables sobre repositorios vulnerables. Su objetivo principal es detectar y localizar fallos de seguridad de forma eficiente, con un coste computacional muy inferior al de modelos mucho más grandes.

El modelo está diseñado para tareas conversacionales y agénticas, con especial énfasis en integraciones de terminal y agentes de seguridad. Su tamaño compacto lo hace adecuado para despliegues en el borde, entornos on-premise o con recursos limitados. Según el blog de Cisco, los modelos Antares (350M y 1B) superan en la tarea de localización de vulnerabilidades a muchos modelos cerrados y abiertos de mayor tamaño, a una fracción del coste. El acceso al modelo está restringido en HuggingFace y requiere aceptar condiciones previas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GraniteMoEHybrid (MoE híbrido basado en IBM Granite 4.0-1B) |
| Parametros totales | 1.837.271.040 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre IBM Granite 4.0-1B, que emplea una arquitectura híbrida de mezcla de expertos (MoE) con componentes de atención tradicional. El tag `granitemoehybrid` confirma esta configuración, aunque no se han publicado detalles específicos sobre el número de expertos activos o la distribución de capas. El entrenamiento sigue un pipeline de dos etapas descrito en el reporte técnico: primero, una fase de supervisión fina (SFT) con datos de razonamiento en ciberseguridad y exploración de repositorios; después, una fase de aprendizaje por refuerzo con recompensas verificables (RLVR) sobre repositorios vulnerables reales, lo que permite al modelo aprender a localizar fallos de forma precisa y verificable. No se han publicado detalles sobre el volumen total de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto conversacional en inglés, optimizado para diálogos multi-turno.
- Localización de vulnerabilidades en código fuente, con capacidad de razonamiento sobre repositorios completos.
- Soporte para flujos agénticos, incluyendo integración con terminales y agentes de seguridad.
- Detección de fallos de seguridad mediante análisis de código y contexto del repositorio.
- Aprendizaje por refuerzo con recompensas verificables, lo que mejora la precisión en tareas de seguridad.
- Despliegue eficiente en entornos con recursos limitados gracias a su tamaño compacto.

## Casos de uso

- Auditoría de seguridad automatizada: el modelo puede analizar repositorios de código en busca de vulnerabilidades conocidas, generando informes detallados de localización y posible explotación.
- Agente de terminal para desarrolladores: integrado como asistente de línea de comandos, responde consultas sobre seguridad del código y sugiere parches.
- Revisión de código en pipelines CI/CD: se puede invocar automáticamente en cada commit para detectar fallos de seguridad antes del despliegue.
- Análisis forense de código: ayuda a los equipos de respuesta a incidentes a localizar rápidamente el punto exacto de una vulnerabilidad explotada.
- Formación en ciberseguridad: genera ejemplos de código vulnerable y explica cómo identificarlos, sirviendo como herramienta educativa.
- Integración en plataformas de gestión de vulnerabilidades: complementa escáneres estáticos tradicionales con razonamiento contextual sobre el repositorio completo.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El blog de Cisco menciona que Antares-1B supera a muchos modelos cerrados y abiertos en localización de vulnerabilidades, pero no se proporcionan cifras concretas (MMLU, HumanEval, etc.). El reporte técnico en PDF podría contener métricas, pero no se ha extraído su contenido en esta búsqueda.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~1,8B parámetros, una cuantización de 4 bits requeriría aproximadamente 1-2 GB de VRAM; en FP16, alrededor de 3,7 GB.
- GPU recomendadas: tarjetas de consumo como RTX 3060 (12 GB) o superiores son suficientes para inferencia en FP16; para cuantizaciones más agresivas, incluso GPUs con 4-6 GB pueden ser viables.
- Compatibilidad con hardware de borde: su tamaño compacto permite ejecución en dispositivos con poca memoria, como Jetson o CPUs con aceleración AVX.
- Opciones de despliegue: compatible con el ecosistema HuggingFace Transformers, y potencialmente con vLLM, llama.cpp u Ollama, aunque no se confirma oficialmente.
- Latencia y throughput: no disponible, pero se espera baja latencia en GPUs modernas dado el tamaño reducido.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de localización de vulnerabilidades en la información proporcionada. Como referencia de tamaño, se puede comparar con modelos generalistas de ~1B como Qwen2.5-1.5B o Llama-3.2-1B, pero no se tienen datos de rendimiento específico en tareas de seguridad para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated en HuggingFace; los usuarios deben aceptar condiciones adicionales antes de su descarga.
- Idioma limitado: solo soporta inglés, lo que restringe su uso en entornos multilingües.
- Sesgos potenciales: al estar entrenado principalmente en datos de ciberseguridad, puede mostrar sesgos hacia patrones de código de ciertos lenguajes o frameworks.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar falsos positivos o negativos en la detección de vulnerabilidades; se recomienda validación humana.
- Uso comercial: la licencia Apache-2.0 permite uso comercial, pero el acceso gated puede implicar restricciones adicionales definidas por el autor.
- Sin garantía de cobertura exhaustiva: la localización de vulnerabilidades es una tarea compleja y el modelo no sustituye a herramientas especializadas ni a revisión experta.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/fdtn-ai/antares-1b)
- [Blog de Cisco: Introducing Antares](https://blogs.cisco.com/ai/introducing-antares-the-most-efficient-open-weight-ai-models-for-vulnerability-localization)
- [Reporte técnico (PDF)](https://cisco-foundation-ai.github.io/antares/technical-report.pdf)
- [Ficha en AIAny](https://aiany.app/item/fdtn-ai-antares-1b)
