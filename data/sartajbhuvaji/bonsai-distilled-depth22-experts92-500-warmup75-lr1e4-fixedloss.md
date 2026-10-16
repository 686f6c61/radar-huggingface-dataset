# sartajbhuvaji/bonsai-distilled-depth22-experts92-500-warmup75-lr1e4-fixedloss

## Resumen

El modelo `sartajbhuvaji/bonsai-distilled-depth22-experts92-500-warmup75-lr1e4-fixedloss` es un modelo de generacion de texto publicado en HuggingFace por el usuario sartajbhuvaji. Su etiqueta de arquitectura (`qwen3_moe`) indica que emplea la clase de modelado MoE de la familia Qwen3, con un total de 5.531.697.664 parametros (~5,53 mil millones) segun los pesos en safetensors, y un tamano de repositorio de 11,1 GB.

El nombre del checkpoint sugiere que se trata de un modelo destilado ("distilled") con profundidad de 22 capas ("depth22") y 92 expertos ("experts92"), entrenado con una tasa de aprendizaje de 1e-4 y 75 pasos de warmup, aunque no hay documentacion que confirme estos detalles. La model card es la plantilla autogenerada por HuggingFace y no incluye informacion sustantiva sobre desarrollo, datos de entrenamiento, licencia o idiomas.

Se trata de un checkpoint con cero descargas y cero "likes" en el momento de la consulta, sin paper asociado, sin benchmarks publicados y sin licencia declarada. Es relevante unicamente como ejemplo de experimento de destilacion sobre arquitectura MoE; no debe considerarse un modelo listo para produccion sin una evaluacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo Qwen3 (`qwen3_moe`, transformers) |
| Parametros totales | 5.531.697.664 (~5,53 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (pesos completos en bf16/fp16, ~11,1 GB de repositorio) |

## Arquitectura y entrenamiento

La etiqueta `qwen3_moe` indica que el modelo usa la implementacion de mezcla de expertos (Mixture-of-Experts) de la familia Qwen3, integrada en la libreria `transformers`. Por el nombre del repositorio cabe inferir una configuracion de 22 capas y 92 expertos, con destilacion como tecnica de entrenamiento, pero no hay confirmacion documental de estos valores ni del numero de expertos activos por token, el enrutador utilizado o el tamano de cada experto. La unica cifra verificable es el recuento total de parametros a partir del archivo safetensors.

No se dispone de informacion sobre el corpus de entrenamiento (numero de tokens, composicion, filtrado), ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. El sufijo "distilled" sugiere que el modelo se entreno para imitar las salidas de un modelo profesor de mayor tamano, y "fixedloss" podria referirse a una correccion en el calculo de la funcion de perdida, pero ambos extremos son conjeturas no verificadas. No se documenta ninguna innovacion tecnica adicional, ni datos sobre infraestructura de entrenamiento.

## Capacidades

- Generacion de texto autoregresiva: el pipeline declarado es `text-generation` con uso conversacional, por lo que se espera que funcione en tareas de continuacion y dialogo.
- Conversacion multi-turno: la etiqueta `conversational` apunta a un uso de chat, aunque no hay formato de plantilla documentado.
- Razonamiento, codigo, matematicas: no disponible; no hay benchmarks ni evaluaciones que lo respalden.
- Tool calling / function calling: no disponible; no se declara soporte explicito.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se declara ningun idioma.
- Modo "thinking", vision o audio: no disponible; no se declaran capacidades multimodales ni modos especiales.

## Casos de uso

- Experimentacion academica con arquitecturas MoE: el modelo permite reproducir configuraciones de 5,5 B de parametros con 92 expertos en entornos de investigacion, siempre que el usuario valide el comportamiento real.
- Destilacion y comparacion de tecnicas de entrenamiento: sirve como punto de partida para estudiar el efecto de la destilacion sobre modelos MoE de tamano medio.
- Fine-tuning especifico de dominio: al ser un modelo relativamente pequeno (~5,5 B), puede ajustarse con LoRA o QLoRA sobre un dominio concreto (legal, medico, tecnico) sin requerir un cluster grande.
- Prototipado rapido de asistentes conversacionales: para pruebas internas donde la calidad no sea critica y el equipo quiera iterar sobre la plantilla de chat.
- Investigacion sobre enrutamiento de expertos: el numero inusualmente alto de expertos (92, segun el nombre) lo hace util para estudiar balanceo de carga y especializacion de expertos.
- Base para benchmarks comparativos de MoE: util para reproducir curvas de escalado frente a otros modelos MoE de tamano similar.

Nota: dado que no hay benchmarks ni licencia declarada, ninguno de estos casos deberia llevarse a produccion sin una evaluacion previa y la verificacion de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones derivadas del recuento de parametros, no verificadas):
  - bf16/fp16: ~11-12 GB solo para pesos, mas cache KV.
  - Cuantizacion de 8 bits: ~6-7 GB.
  - Cuantizacion de 4 bits: ~3,5-4,5 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue con margen amplio; RTX 4090 (24 GB), RTX 4080 (16 GB) y RTX 4070 Ti (16 GB) para bf16 en contextos cortos.
- Compatibilidad con GPU de consumo: si, es probable que quepa en tarjetas de 12-16 GB en bf16 con contexto reducido, y en tarjetas de 8 GB aplicando cuantizacion de 4 bits.
- Opciones de despliegue: `transformers` de forma nativa (clase `qwen3_moe`); vLLM y SGLang soportan arquitecturas Qwen3 MoE y serian las opciones preferidas para servir; llama.cpp/Ollama requeririan convertir los pesos a GGUF, paso que no esta documentado.
- Latencia y throughput estimados: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

Los valores de este modelo marcados como "no disponible" reflejan la ausencia de datos en la model card. Las cifras de los modelos comparados corresponden a sus fichas publicas y pueden variar segun la version.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia |
|---|---|---|---|---|
| bonsai-distilled (este modelo) | ~5,53 B | no disponible | no disponible | no disponible |
| Qwen1.5-MoE-A2.7B | ~14,3 B | ~2,7 B | 32K | Apache 2.0 |
| DeepSeek-V2-Lite | ~15,7 B | ~2,4 B | 32K | DeepSeek License |
| Qwen3-30B-A3B | ~30,5 B | ~3,3 B | 32K (extensible a 131K) | Apache 2.0 |

No hay datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla autogenerada, sin datos de entrenamiento, uso previsto, sesgos ni evaluaciones.
- Licencia no declarada: no se puede asumir uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de alucinacion desconocido: no hay evaluaciones de fidelidad ni de tasas de error.
- Idiomas no declarados: se desconoce si el modelo funciona correctamente en castellano o en otros idiomas distintos del ingles.
- Sin benchmarks: no hay evidencia de rendimiento en MMLU, HumanEval, GSM8K ni en cualquier otra tarea estandar.
- Cero adopcion: el repositorio no registra descargas ni "likes", por lo que no hay retroalimentacion de la comunidad sobre su comportamiento real.
- Formato unico de pesos: al publicarse solo en safetensors, no hay versiones GGUF listas para usar con llama.cpp u Ollama.
- Fecha de creacion atipica (2026-10-15): conviene verificar la integridad del repositorio antes de confiar en el.
- Sin garantia de mantenimiento: el autor no ha publicado actualizaciones ni informacion de contacto.

## Enlaces

- HuggingFace: https://huggingface.co/sartajbhuvaji/bonsai-distilled-depth22-experts92-500-warmup75-lr1e4-fixedloss
- Referencia citada en la model card (calculadora de impacto de carbono, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
- Calculadora ML Impact: https://mlco2.github.io/impact
- Paper o blog del modelo: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
