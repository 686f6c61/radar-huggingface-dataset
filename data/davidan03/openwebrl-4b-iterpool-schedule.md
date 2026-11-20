# davidan03/openwebrl-4b-iterpool-schedule

## Resumen

OpenWebRL-4b-iterpool-schedule es un conjunto de adaptadores LoRA publicados por el usuario davidan03 sobre el modelo base OpenWebRL-4B-SFT, un modelo de 4.000 millones de parámetros orientado a tareas de agente web y construido sobre la familia Qwen3-VL. El repositorio no contiene pesos completos, sino dos adaptadores de rango 16 entrenados con una receta de optimización por preferencias (RPO, que combina DPO con un término de SFT) sobre 11.554 pares de episodios exitosos de navegación web. El objetivo del experimento es comparar dos estrategias de ordenación de datos: agrupar todos los datos y entrenar una sola vez, frente a encadenar dos rondas bajo una única curva de learning rate.

El interés técnico del artefacto reside en que documenta de forma explícita la receta de entrenamiento (hiperparámetros, tamaños de lote, hardware, checkpoints intermedios y métricas de validación retenidas) y permite reproducir la comparación entre ambas políticas de datos. Sin embargo, el propio autor indica que el modelo aún no ha sido evaluado, no se especifica la licencia y el pipeline no está declarado, por lo que debe tratarse como un experimento de investigación y no como un artefacto listo para producción.

La relevancia actual viene del auge de los agentes web entrenados con refuerzo y preferencias: entender cómo afecta el orden y la composición de los datos de episodios al rendimiento final es una cuestión abierta, y este repositorio aporta un punto de comparación reproducible sobre una base de 4B con capacidades multimodales heredadas de Qwen3-VL.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la de Qwen3-VL a través de OpenWebRL-4B-SFT); adaptadores LoRA sobre proyecciones de atención y MLP |
| Parámetros totales | 4B en el modelo base; los adaptadores LoRA son de rango 16 con alpha 32 (número exacto de parámetros del adaptador no disponible) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio publica adaptadores en safetensors; la cuantización dependerá del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); el repositorio ocupa 1,2 GB |

## Arquitectura y entrenamiento

El modelo base es OpenWebRL-4B-SFT, un transformer de 4.000 millones de parámetros de la familia Qwen3-VL, es decir, con torre visual y capacidades multimodales. Sobre él se aplican dos adaptadores LoRA independientes con rango 16, alpha 32, sobre todas las proyecciones de atención y MLP. El entrenamiento usa la receta RPO de la ronda 1: DPO con beta 0,1 más un término de SFT con peso 1,0 sobre pares de episodios exitosos, referencia fijada en OpenWebRL-4B-SFT, learning rate pico de 5e-5, warmup de 512 ejemplos, decaimiento coseno hasta 2,5e-5, batch de 32 y 2 GPU H200.

Ambos adaptadores ven los mismos 11.554 pares del dataset Sol (5.304 de la ronda 1, mitad A, y 6.250 recogidos por el modelo de la ronda 1, mitad B) durante dos épocas, lo que suma 723 actualizaciones. La diferencia está en el orden: el adaptador `pooled` mezcla A y B y entrena una sola vez, mientras que `seqsched` encadena dos épocas de A y luego dos de B bajo una única curva de learning rate, sin re-warmup, con un LR de 4,41e-5 en el punto de cambio (actualización 332). Se publican checkpoints intermedios en las actualizaciones 181, 362 y 542, y en `seqsched` también en la 332.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base Qwen3-VL de 4B.
- Capacidades multimodales (visión) heredadas de la arquitectura Qwen3-VL, aunque no se documenta su conservación tras el ajuste LoRA.
- Comportamiento de agente web: el entrenamiento se realiza sobre episodios de navegación, por lo que el adaptador está orientado a seleccionar acciones dentro de entornos web.
- Aprendizaje por preferencias: los adaptadores incorporan la señal de DPO/RPO sobre trayectorias exitosas.
- Soporte de tool calling: no disponible explícitamente en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo de razonamiento explícito (thinking): no disponible.

## Casos de uso

- Investigación sobre ordenación de datos en RLHF/DPO: comparar `pooled` frente a `seqsched` con la misma semilla de datos permite aislar el efecto del currículo de entrenamiento en el rendimiento de un agente web.
- Reproducción de recetas de ajuste por preferencias: el repositorio incluye la configuración congelada, las métricas, la validación retenida y el script sbatch, lo que facilita replicar el experimento en un clúster con 2 GPU H200.
- Punto de partida para agentes de navegación: cargando el adaptador sobre OpenWebRL-4B-SFT se obtiene un modelo de 4B especializado en interacción web, adecuado para prototipos de automatización de tareas en navegador.
- Estudio de currículos de dos rondas: útil para equipos que recogen datos con un modelo inicial y luego quieren incorporarlos sin reiniciar el entrenamiento desde cero.
- Base para evaluación de agentes multimodales: al heredar Qwen3-VL, permite probar si el ajuste LoRA degrada o preserva las capacidades visuales del modelo original.
- Análisis de checkpoints intermedios: los puntos en las actualizaciones 181, 332, 362 y 542 permiten estudiar la dinámica de convergencia y el olvido catastrófico a lo largo del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo aún no ha sido evaluado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para los adaptadores; para el modelo base de 4B en precisión completa se necesitan del orden de 8-10 GB, y en cuantización de 4 bits alrededor de 3-4 GB, aunque estos valores dependen del modelo base y no están documentados en el repositorio.
- GPU recomendadas: el entrenamiento se realizó en 2 GPU H200; para inferencia basta una GPU con al menos 8-16 GB de VRAM según precisión.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas como RTX 3090, RTX 4090 o RTX 4080 con cuantización, siempre que el modelo base lo permita.
- Opciones de despliegue: al ser adaptadores PEFT, se cargan con `PeftModel.from_pretrained` sobre el modelo base; el despliegue posterior puede hacerse con vLLM, TGI o llama.cpp una vez fusionados los adaptadores, aunque no se documenta compatibilidad explícita.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| OpenWebRL-4b-iterpool-schedule | 4B (base) + LoRA r16 | no disponible | no disponible | Hugging Face, 0 descargas | Adaptadores de investigación, sin evaluar |
| OpenWebRL-4B-SFT | 4B | no disponible | no disponible | Modelo base referenciado | Punto de partida del ajuste |
| Qwen3-VL (familia) | no disponible | no disponible | no disponible | Ampliamente disponible | Arquitectura subyacente con capacidades visuales |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El autor declara que el modelo no ha sido evaluado; no hay evidencia publicada de su rendimiento real.
- La licencia no está especificada, lo que impide determinar si se permite el uso comercial.
- El `adapter_config.json` referencia el modelo base por su ruta local de clúster, por lo que es necesario reescribirla para cargarlo correctamente.
- Al ser adaptadores LoRA, requieren cargar el modelo base OpenWebRL-4B-SFT, lo que añade dependencia y coste de almacenamiento.
- Riesgo de alucinación y sesgos: no documentados, pero inherentes a un modelo de 4B ajustado sobre datos de navegación web.
- El entrenamiento se limita a 11.554 pares de episodios exitosos, lo que puede inducir sobreajuste a un dominio estrecho de tareas web.
- No se documentan idiomas soportados ni longitud de contexto, lo que dificulta planificar su uso en producción.
- Los checkpoints intermedios y las métricas de validación están incluidos, pero sin resultados de benchmarks externos no es posible validar la calidad del ajuste.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/davidan03/openwebrl-4b-iterpool-schedule
- Modelo base referenciado: OpenWebRL-4B-SFT (no se proporciona URL directa en la información disponible)
