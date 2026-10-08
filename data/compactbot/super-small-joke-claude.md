# Compactbot/super-small-joke-claude

# SuperSmallJokeClaude (Compactbot/super-small-joke-claude)

## Resumen

SuperSmallJokeClaude es un transformer minúsculo de 1.644.032 parametros (1,64M) entrenado desde cero por el usuario Compactbot y publicado en HuggingFace. No es un modelo de produccion: el propio autor lo describe como una broma tecnica, un artefacto experimental creado para demostrar que es posible entrenar un transformer funcional en 7 segundos sobre una unica GPU (una RTX 5090). Su unico repositorio ocupa 0,0 GB y no acumula descargas ni likes en el momento de la consulta.

El modelo emplea una arquitectura transformer de 4 capas con d_model=128, 4 cabezas de atencion, d_ff=256 y embeddings atados, con un vocabulario BPE de 8192 tokens derivado del tokenizador de Claude Code. La ventana de contexto es de solo 512 tokens y el entrenamiento se realizo sobre 24.249 tokens procedentes de trazas del asistente Fable 5 Claude Code, durante 2000 pasos con batch 8 y secuencia de 256, alcanzando una perdida final de 2,90.

Su relevancia no es funcional sino didactica: sirve como ejemplo minimo reproducible de pipeline completo de entrenamiento (tokenizador, bucle de entrenamiento, checkpoint y carga en inferencia) y como recordatorio de los limites practicos de un modelo de este tamano. El propio autor advierte de que produce salidas degeneradas con tokens repetidos y texto sin sentido, y que no resulta util para ninguna tarea real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 4 capas, d_model=128, 4 cabezas de atencion, d_ff=256, embeddings atados (tied embeddings) |
| Parametros totales | 1.644.032 (1,64M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (no se publican versiones cuantizadas; el checkpoint distribuido esta en punto flotante de PyTorch) |
| Idiomas soportados | No disponible (los datos de entrenamiento son trazas en ingles del asistente Claude Code, pero el autor no declara cobertura idiomatica) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`final.pt`, con `model_state_dict` + `config` + metadatos de entrenamiento) y tokenizador en `tokenizer.json` (BPE-8192) |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only clasico, sin innovaciones arquitectonicas: 4 capas, dimension de modelo de 128, 4 cabezas de atencion y una red feed-forward de dimension 256 (ratio de expansion de 2x sobre d_model). Los embeddings de entrada y la proyeccion de salida estan atados, lo que reduce el recuento de parametros. El vocabulario es un BPE de 8192 tokens reutilizado del tokenizador de Claude Code, lo que implica que buena parte de los parametros totales (8192 x 128 = 1.048.576) corresponden a la matriz de embeddings.

El entrenamiento es deliberadamente minimo: 24.249 tokens de datos (trazas del asistente Fable 5 Claude Code), 2000 pasos, batch de 8, longitud de secuencia de 256, optimizador AdamW con learning rate 3e-4 y schedule coseno. La perdida final reportada es de 2,90 en 7 segundos de computo sobre una RTX 5090. No se menciona ninguna fase de RLHF, DPO, SFT posterior ni decodificacion especulativa. El volumen de datos es muy inferior al necesario para que el modelo aprenda estructura linguistica utilizable, y la propia model card lo enmarca como una demostracion de viabilidad del pipeline, no como un resultado de calidad.

## Capacidades

- Generacion de texto autoregresiva a nivel de token, con tokenizador BPE de 8192 entradas.
- Ninguna capacidad fiable de razonamiento, codigo, matematicas o comprension lectora: el autor indica explicitamente que la salida es degenerada.
- No dispone de tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles; el corpus de entrenamiento es de trazas en ingles y no hay evaluacion de otros idiomas.
- No dispone de modo thinking, vision, audio ni ninguna capacidad multimodal.
- Su utilidad real es como material didactico: ejemplo reproducible de entrenamiento e inferencia de un transformer desde cero.

## Casos de uso

- Docencia de arquitecturas transformer: el modelo permite recorrer el ciclo completo (tokenizacion, entrenamiento, checkpoint, carga y generacion) en una sesion de clase, dado que el entrenamiento completo dura 7 segundos en una RTX 5090.
- Test de pipelines de entrenamiento: sirve como caso de prueba de humo para verificar que un script de entrenamiento personalizado converge y guarda correctamente `model_state_dict`, `config` y metadatos.
- Validacion de codigo de carga de checkpoints: el fragmento de carga publicado en la model card es un ejemplo minimo para comprobar que una utilidad de carga de `torch.load` y `load_state_dict` funciona antes de pasar a modelos reales.
- Prototipado de tokenizadores BPE: al distribuir un `tokenizer.json` de 8192 entradas, permite experimentar con tokenizacion y detokenizacion sin depender de modelos grandes.
- Benchmarking de infraestructura: sirve para medir latencia y overhead de arranque de frameworks de inferencia en un escenario de carga minima, aislando el coste fijo del runtime.
- Reproducibilidad de experimentos: al ser un artefacto diminuto (menos de 10 MB en punto flotante de 32 bits), es facil de versionar, comparar entre commits y usar en pruebas de regresion de un repositorio de investigacion.
- No debe emplearse en atencion al cliente, generacion de codigo en produccion, resumen, traduccion ni ninguna aplicacion orientada a usuario final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado por el autor es la perdida final de entrenamiento (2,90) sobre las trazas del corpus, que no es comparable con metricas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,6 MB en fp32 (1.644.032 parametros x 4 bytes), unos 3,3 MB en fp16/bf16 y unos 1,6 MB en int8. La cache KV para contexto de 512 tokens con 4 capas y 4 cabezas de dimension 32 es del orden de 0,5 MB por secuencia en fp32.
- GPU recomendadas: irrelevante por tamano; cualquier GPU con soporte CUDA, o incluso CPU, es suficiente. El autor reporta el entrenamiento completo en 7 segundos en una RTX 5090.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.), en GPUs integradas e incluso en CPU sin dificultad.
- Opciones de despliegue: el checkpoint es un `final.pt` de PyTorch con el `state_dict` y la `config`, por lo que requiere reconstruir la clase `Transformer` definida en `train_jokeclaude_v5.py`. No se distribuyen pesos en safetensors ni en GGUF, de modo que no es directamente cargable con llama.cpp, Ollama, vLLM ni TGI sin una conversion previa no documentada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SuperSmallJokeClaude (Compactbot) | 1,64M | 512 tokens | Perdida final de entrenamiento 2,90; sin benchmarks publicados | No disponible | HuggingFace, pesos en `final.pt` |
| nanoGPT `shakespeare_char` (Karpathy) | ~10,7M | 256 tokens | No disponible | MIT (repositorio) | Codigo y pesos reproducibles |
| TinyStories-1M (Microsoft Research) | ~1M | 512 tokens | Generacion coherente en ingles simple, segun el paper de TinyStories | No disponible en la informacion proporcionada | HuggingFace |

La comparacion debe tomarse con cautela: se trata de modelos de escala similar empleados como demostraciones de entrenamiento, pero no se dispone de datos de benchmarks homogeneos para establecer una comparacion de rendimiento rigurosa. La diferencia cualitativa principal del modelo de Compactbot es el tamano del corpus (24.249 tokens), muy inferior al de las alternativas citadas, lo que explica sus salidas degeneradas.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo no es util para ninguna tarea real y que produce salidas degeneradas, con repeticion de tokens y texto sin sentido.
- Riesgo de alucinacion total: no hay conocimiento factual aprendido con 24.249 tokens de entrenamiento.
- Sesgos conocidos: no disponibles; no se ha realizado ninguna evaluacion de sesgos.
- Limitacion de contexto severa: 512 tokens, insuficiente para conversaciones multi-turno o documentos.
- Cobertura idiomatica no declarada; el corpus se limita a trazas en ingles.
- Licencia no disponible, lo que impide determinar si se permite el uso comercial. Ante la ausencia de terminos explicitos, no debe asumirse permiso de uso comercial.
- El repositorio figura con 0 descargas y 0 likes, y no hay pipeline ni metadatos de idioma declarados en HuggingFace.
- No se distribuyen pesos en formatos estandar de inferencia (GGUF, safetensors), por lo que la integracion requiere codigo propio.
- La fecha de creacion del repositorio es 2026-10-07 y la ultima actualizacion 2026-10-07, con un intervalo de poco mas de un minuto entre ambas, coherente con un artefacto experimental sin mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Compactbot/super-small-joke-claude
- Repositorio del autor (referenciado en la model card, sin URL publica): `train_jokeclaude_v5.py` — no disponible como enlace
- Paper o blog tecnico: no disponible
- Demo: no disponible
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces recuperados corresponden a resenas del objetivo Nikon Z 28-400mm f/4-8 VR (photographylife.com, kenrockwell.com, highendlenses.com, digitalcameraworld.com) y no guardan relacion con el modelo.
