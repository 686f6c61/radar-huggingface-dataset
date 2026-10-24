# long2711/lab22-dpo-vn-long-2A202602471

## Resumen

`long2711/lab22-dpo-vn-long-2A202602471` es un adaptador LoRA entrenado con DPO (Direct Preference Optimization) sobre un modelo base Qwen3-4B-Instruct-2507 en cuantización de 4 bits de Unsloth. Lo publica Nguyễn Hải Long (autor `long2711`) como entrega del Track 3 del Day22, y su propósito es ajustar las preferencias de un modelo intermedio ya sometido a SFT en vietnamita, no ofrecer un modelo completo listo para producción. El repositorio ocupa 0,1 GB y contiene únicamente los pesos del adaptador en safetensors con la librería PEFT.

La relevancia es fundamentalmente metodológica: documenta un pipeline completo de SFT (1000 muestras de `saillab/alpaca-vietnamese-cleaned`, una época) seguido de DPO (800 pares de `sailor2/sea-ultrafeedback-onpolicy`, β = 0,1, learning rate 5e-6, rango LoRA 16 y alpha 32) ejecutado en una RTX 3060 de 12 GB. Es, por tanto, un caso reproducible de alineación de preferencias en un idioma de recursos medios con hardware de consumo.

El autor advierte explícitamente de que el adaptador no se puede reconstruir solo con el modelo base público: hace falta ejecutar el notebook de SFT previo para generar `models/sft-merged/` y cargar después el adaptador DPO sobre esa versión intermedia. Los resultados publicados son modestos y con muestras pequeñas: la win rate frente al SFT es del 52% con un intervalo de confianza del 95% de [43%, 62%], que incluye el 50% y por tanto no demuestra superioridad estadística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer Qwen3-4B-Instruct-2507; arquitectura interna del base no detallada en la informacion disponible |
| Parametros totales | No disponible para el adaptador; el base se identifica como "4B" en su nomenclatura (no verificado en la informacion proporcionada) |
| Parametros activos | No aplica: no es un modelo MoE, es un adaptador LoRA |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Adaptador en safetensors sin cuantizar; el base referenciado esta publicado en bnb-4bit. No se documentan GGUF, AWQ ni GPTQ |
| Idiomas soportados | Vietnamita (vi), idioma del ajuste SFT y DPO; cobertura del modelo base no disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); repositorio de 0,1 GB |

Otros hiperparametros documentados: rango LoRA 16, alpha 32, β de DPO 0,1, learning rate 5e-6, una epoca.

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) aplicado sobre `unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit`, un Qwen3 de 4B en cuantizacion de 4 bits. El pipeline tiene dos etapas: primero un SFT sobre 1000 muestras de `saillab/alpaca-vietnamese-cleaned` durante una epoca, cuyo resultado se fusiona en `models/sft-merged/`; después un DPO sobre 800 pares de preferencia de entrenamiento y 100 pares held-out de `sailor2/sea-ultrafeedback-onpolicy`, con particion realizada por prompt para evitar filtracion entre train y evaluacion.

El entrenamiento se ejecuto en una RTX 3060 de 12 GB con Python 3.11 y una configuracion de tier T4. No se documentan en la informacion disponible el numero total de tokens vistos, la composicion completa del dataset ni innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, modo thinking). El autor menciona un experimento aparte con GRPO que no forma parte de este adaptador.

## Capacidades

- Generacion de texto en vietnamita, idioma objetivo del ajuste SFT y del DPO.
- Alineacion de preferencias: el adaptador modula las respuestas del modelo SFT hacia las preferencias recogidas en `sea-ultrafeedback-onpolicy`.
- Razonamiento matematico basico: GSM8K pasa de 82,0% en SFT a 85,2% tras el DPO, segun la evaluacion del autor.
- Seguimiento de instrucciones: IFEval pasa de 49,0% a 50,0%, una mejora marginal.
- Conocimiento multilingue evaluado en vietnamita: Global-MMLU-vi se mantiene en 24,21% en ambas etapas.
- Indicios de soporte de tool calling en la plantilla del base, aunque el autor reporta tokens `<tool_call>` residuales no deseados en algunas salidas, lo que obliga a limpiar el template antes de desplegar.
- No se documentan capacidades de vision, audio, agentes multi-paso ni modo thinking en la informacion disponible.

## Casos de uso

- Experimentacion academica reproducible: el pipeline SFT + DPO esta pensado para ejecutarse en una RTX 3060 de 12 GB, lo que permite reproducir el flujo completo de alineacion de preferencias en vietnamita con hardware de consumo.
- Ajuste de tono y estilo en asistentes conversacionales en vietnamita: el DPO sobre 800 pares de preferencia sirve para modular registro y formato de respuesta sobre una base SFT ya funcional, sin reentrenar el modelo completo.
- Generacion de candidatos para anotacion humana: el adaptador puede producir pares de respuesta que los anotadores ordenen, alimentando siguientes iteraciones de DPO; su win rate del 52% indica que la senal de preferencia es debil pero utilizable como generador.
- Prototipado de adaptadores por dominio con PEFT: al ser un LoRA de 0,1 GB, se puede cargar y descargar sobre el SFT fusionado para comparar variantes sin duplicar el modelo base.
- Evaluacion de reward models: el autor emplea un panel de dos reward models Skywork sobre 50 prompts held-out, un montaje reutilizable para medir la calidad de adaptadores de preferencia en otros dominios.
- Razonamiento aritmetico en vietnamita: con un 85,2% en GSM8K, es adecuado para prototipos de resolucion de problemas matematicos escolares en ese idioma, siempre con validacion posterior.
- Investigacion sobre seguridad y plantillas: dado que el autor detecta tokens `<tool_call>` residuales, el adaptador es util como caso de estudio de limpieza de chat templates antes de desplegar.

## Benchmarks y rendimiento

| Metrica | SFT (pre-DPO) | Adaptador DPO | Notas |
|---|---|---|---|
| IFEval | 49,0% | 50,0% | Mejora de 1 punto |
| GSM8K | 82,0% | 85,2% | Mejora de 3,2 puntos |
| Global-MMLU-vi | 24,21% | 24,21% | Sin cambio; limitaciones de muestreo descritas en `submission/REFLECTION.md` |
| Reward accuracy (held-out) | No disponible | 62% | Sobre 100 pares held-out |
| Reward gap (held-out) | No disponible | +0,0414 | Diferencia media de recompensa |
| Win rate DPO vs SFT (panel de 2 reward models Skywork) | Referencia | 52%, IC 95% [43%, 62%] | 50 prompts held-out; el intervalo contiene el 50% |
| GRPO (experimento separado, no incluido en este adaptador) | 51% | 49% | 100 preguntas; no forma parte de estos pesos |

No se han publicado resultados de benchmarks adicionales (MMLU completo, HumanEval, MT-Bench u otros) en la informacion disponible.

## Requisitos de hardware

- Espacio en disco: 0,1 GB para el adaptador; hay que sumar el modelo SFT fusionado completo para la inferencia real.
- VRAM estimada para el base en 4 bits (bnb-4bit): en torno a 2,5-3 GB de pesos, con overhead de activaciones y KV cache que situaria la inferencia practica en el rango de 4-6 GB (estimacion a partir del tamano del base, no medida publicada).
- VRAM estimada en FP16: aproximadamente 8 GB solo para pesos, mas overhead (estimacion).
- GPU utilizada en el entrenamiento y el ajuste: RTX 3060 de 12 GB; el autor menciona una configuracion de tier T4.
- Cabe en GPU de consumo: si, en tarjetas de 8-12 GB con el base cuantizado; no se documentan pruebas en GPUs de gama de entrada con 6 GB o menos.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), fusion con `merge_and_unload` para servir con vLLM o TGI. No se documenta conversion a GGUF para llama.cpp u Ollama, que requeriria fusionar previamente el adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resultados publicados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador DPO (long2711) | Adaptador LoRA sobre base de 4B | No disponible | IFEval 50,0%; GSM8K 85,2%; Global-MMLU-vi 24,21%; win rate 52% vs SFT | No disponible | Publico en HuggingFace, 0 descargas, 0 likes |
| SFT fusionado previo (`models/sft-merged/`) | Base de 4B | No disponible | IFEval 49,0%; GSM8K 82,0%; Global-MMLU-vi 24,21% | No disponible | No publicado como repo independiente segun la informacion disponible |
| `unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit` (base) | 4B en 4 bits | No disponible | No evaluado en la model card del adaptador | No disponible en la informacion proporcionada | Publico en HuggingFace |

No se dispone de datos sobre otros adaptadores DPO en vietnamita comparables en la informacion proporcionada, por lo que la comparativa se limita a las etapas del mismo pipeline.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir permiso de uso comercial hasta que el autor la declare.
- No es un modelo completo: requiere el SFT fusionado generado en el notebook previo; el modelo base publico por si solo no reproduce el pipeline, segun advierte el propio autor.
- Evidencia de mejora debil: la win rate del 52% con IC 95% [43%, 62%] incluye el 50%, por lo que no se demuestra que el DPO supere al SFT.
- Muestras muy pequenas: 800 pares de entrenamiento, 100 de held-out y 50 prompts en el panel de evaluacion; los intervalos de confianza son amplios.
- Sesgo de evaluacion: los reward models usados comparten grupo de desarrollo con la fuente de etiquetas de preferencia, lo que puede inflar o distorsionar la medicion.
- Plantilla sin limpiar: se detectan tokens `<tool_call>` residuales en algunas salidas; es necesario sanear el chat template antes de cualquier despliegue.
- Seguridad insuficientemente evaluada: solo se probaron cuatro prompts fijos, por lo que el adaptador no es apto para aplicaciones con requisitos altos de seguridad.
- Idioma: ajustado unicamente en vietnamita; no hay evaluacion del posible deterioro en otros idiomas tras el DPO.
- Riesgo de alucinacion no medido: no se han publicado metricas de factualidad ni de tasa de alucinacion.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta.
- El experimento GRPO mencionado en la model card no esta incluido en estos pesos y no debe atribuirse a este adaptador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/long2711/lab22-dpo-vn-long-2A202602471
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit
- Repositorio de codigo, notebooks y graficas (GitHub Day22): https://github.com/long27112003/K4-L3-Track3-Day22-NguyenHaiLong-2A202602471
- Dataset de SFT: https://huggingface.co/datasets/saillab/alpaca-vietnamese-cleaned
- Dataset de preferencias: https://huggingface.co/datasets/sailor2/sea-ultrafeedback-onpolicy
- Informe de reflexion con limitaciones de muestreo: `submission/REFLECTION.md` dentro del repositorio de GitHub
