# AlonMal/granite-4.1-3b-sr

## Resumen

Granite-4.1-3b-sr es una conversión del modelo ibm-granite/granite-4.1-3b de IBM a la arquitectura Shadow Residual (SR), publicada por el usuario AlonMal. No se trata de un modelo nuevo entrenado desde cero, sino de una re-disposición de los pesos originales del modelo base para que puedan entrenarse adaptadores SR con PEFT LoRA estándar. Con ningún adaptador acoplado, el modelo reproduce las salidas del modelo base de IBM.

La propuesta técnica consiste en ejecutar dos flujos por cada capa del decodificador: un flujo base congelado (el modelo original sin adaptar) y un flujo de adaptador entrenable (deltas LoRA más una inyección cruzada de bajo rango por capa desde el flujo base). Para ello, las proyecciones fusionadas del modelo original se separan en proyecciones independientes q/k/v y gate/up.

El modelo cuenta con 3.402.836.480 parámetros en formato safetensors, un repositorio de 6,8 GB y licencia Apache 2.0. Es relevante para investigadores que quieran experimentar con la arquitectura SR sobre un modelo base compacto sin tener que reentrenar los pesos originales, aunque la información publicada sobre el modelo es muy limitada: no hay datos de benchmarks, idiomas soportados ni detalles del entrenamiento del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con arquitectura Shadow Residual (SR): flujo base congelado más flujo de adaptador entrenable con inyección cruzada de bajo rango por capa |
| Parámetros totales | 3.402.836.480 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en ibm-granite/granite-4.1-3b, recableado para la arquitectura Shadow Residual. En SR, cada capa del decodificador procesa dos flujos en paralelo: un flujo base congelado que corresponde al modelo original sin adaptar, y un flujo de adaptador entrenable que combina deltas LoRA con una inyección cruzada de bajo rango procedente del flujo base, aplicada por capa. Las proyecciones fusionadas del modelo original se han dividido en proyecciones separadas q/k/v y gate/up para permitir esta doble circulación.

Los pesos publicados son los del modelo base reordenados para SR; no se ha realizado un entrenamiento adicional sobre ellos. Los puntos de inyección cruzada entre flujos están inicializados a cero por construcción y no se almacenan en el repositorio, sino que se recrean al cargar el modelo. Con ningún adaptador acoplado, las salidas coinciden con las del modelo base. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional, heredada del modelo base ibm-granite/granite-4.1-3b.
- Punto de partida para entrenar adaptadores SR con PEFT LoRA estándar sobre un flujo base congelado.
- Separación de proyecciones q/k/v y gate/up que facilita la instrumentación por capa y el análisis de activaciones.
- Reproducción exacta de las salidas del modelo base cuando no se acopla ningún adaptador.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada (depende del modelo base, no documentado aquí).
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Investigación en arquitecturas de adaptación: el modelo sirve como banco de pruebas para estudiar la arquitectura Shadow Residual sobre un transformer de 3,4 mil millones de parámetros, comparando el flujo base congelado frente al flujo de adaptador.
- Entrenamiento de adaptadores LoRA con PEFT: permite acoplar adaptadores SR mediante `PeftModel.from_pretrained` sin modificar los pesos base, útil para experimentos de ajuste eficiente en parámetros.
- Análisis de activaciones por capa: al tener proyecciones q/k/v y gate/up separadas, facilita la inspección de representaciones internas y la atribución de cambios a capas concretas.
- Reproducción de experimentos: al producir las salidas del modelo base sin adaptador, permite validar que la conversión a SR no altera el comportamiento original antes de entrenar.
- Desarrollo de pipelines de ajuste con licencia permisiva: la licencia Apache 2.0 del repositorio facilita su uso en entornos de investigación y en prototipos comerciales internos.
- Docencia y formación técnica: sirve para ilustrar cómo se reordena un modelo preentrenado para soportar flujos duales y adaptadores de bajo rango.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 6,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, se recomienda al menos 10-12 GB para secuencias cortas.
- VRAM estimada en cuantización de 8 bits: alrededor de 3,5-4 GB para pesos, más overhead.
- VRAM estimada en cuantización de 4 bits: alrededor de 2-2,5 GB para pesos, más overhead.
- GPU recomendadas: A100, H100 o L40S para entrenamiento de adaptadores y experimentación con lotes grandes; RTX 4090 o RTX 3090 para inferencia en fp16 y ajuste LoRA de un solo adaptador.
- Cabe en GPU de consumo: sí, en tarjetas con 12-16 GB o más en fp16, y en tarjetas de 8 GB con cuantización.
- Opciones de despliegue: requiere el paquete `shadow-residual` instalado para registrar el tipo de modelo `shadow_residual` en `transformers`; no usa `trust_remote_code`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| AlonMal/granite-4.1-3b-sr | 3.402.836.480 | no disponible | apache-2.0 | Reordenación SR del modelo base para adaptadores PEFT |
| ibm-granite/granite-4.1-3b | no disponible en la información | no disponible | no disponible en la información | Modelo base original de IBM |
| Alternativas de ~3B para ajuste eficiente | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

La comparación cuantitativa con otras alternativas de la misma categoría no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo no ha sido entrenado: es una reordenación de pesos del modelo base; sin adaptador acoplado, no aporta capacidades nuevas.
- Requiere instalar el paquete `shadow-residual` para cargarse; sin él, `transformers` no reconoce el tipo de modelo.
- No se documentan los idiomas soportados ni la longitud de contexto, por lo que no puede garantizarse su comportamiento en producciones multilingües o con contextos largos.
- Riesgo de alucinación y sesgos: heredados del modelo base ibm-granite/granite-4.1-3b, no evaluados en esta ficha.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de IBM antes de desplegarlo en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- No hay benchmarks publicados que permitan estimar su calidad frente al modelo base ni frente a alternativas.
- La fecha de creación indicada (2026-11-02) es posterior a la de esta ficha; conviene verificar la vigencia de los metadatos.

## Enlaces

- [Hugging Face: AlonMal/granite-4.1-3b-sr](https://huggingface.co/AlonMal/granite-4.1-3b-sr)
- [Modelo base: ibm-granite/granite-4.1-3b](https://huggingface.co/ibm-granite/granite-4.1-3b)
- Paquete `shadow-residual`: no disponible enlace en la información proporcionada
- Paper o blog de la arquitectura Shadow Residual: no disponible enlace en la información proporcionada
