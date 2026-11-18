# jamespetts/yue2-1980s-italo-disco-lora

## Resumen

`jamespetts/yue2-1980s-italo-disco-lora` es un adaptador LoRA de tipo NAR (non-autoregressive) para el motor de generacion musical YuE2, desarrollado por James E. Petts. No es un modelo generativo autonomo, sino un adaptador de textura y timbre que se aplica sobre los pesos base `Comfy-Org/YuE2` (derivados de `m-a-p/YuE2-3B`) para modular como suena la musica generada, no que notas, armonia o estructura se producen. El adaptador se entreno sobre un corpus propio de 12 pistas de Italo-Disco generadas con IA (CC0), sin grabaciones de terceros.

El modelo resuelve un problema concreto: en la arquitectura de dos ramas de YuE2, la rama AR (autoregresiva) controla la composicion (notas, armonia, arreglo) mientras que la rama NAR controla la produccion sonora (timbre, mezcla, caracter de produccion). Este LoRA actua exclusivamente sobre la rama NAR, permitiendo fijar un caracter de produccion Italo-Disco de los anos 80 — caja de ritmos four-on-the-floor con snare con gate, bajo secuenciado dominante, pads con chorus, produccion calida con agudos suaves — sin alterar la estructura compositiva.

El adaptador es relevante para desarrolladores que trabajen con pipelines de generacion musical en ComfyUI o en el motor audio.cpp y necesiten un control reproducible sobre el caracter sonoro de la salida. Su licencia CC BY-NC 4.0 restringe el uso comercial, tanto de los pesos como de los adaptadores derivados del modelo base de m-a-p. El repositorio ocupa 0,2 GB y acumula 4193 descargas desde su publicacion en noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA NAR (non-autoregressive) sobre YuE2; rank 16, alpha 16 |
| Parametros totales | no disponible (adaptador LoRA, no modelo completo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16 para el base; adaptador en safetensors) |
| Idiomas soportados | no disponible (generacion musical, no texto) |
| Licencia | CC BY-NC 4.0 (pesos); salidas CC0 |
| Formato de pesos | safetensors (dos variantes: fused PEFT y unfused audio.cpp) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `yue2_3b_bf16` mediante ComfyUI-YuE2-Trainer, con configuracion rank 16, alpha 16, optimizador adamw_8bit, scheduler cosine, warmup de 50 pasos, 2000 pasos totales, caption_dropout 0.1 y muestreo t uniforme con semilla 20261101. El entrenamiento se ejecuto en una RTX 2080 Ti de 11 GB con PyTorch 2.14.1+cu130 en 25 minutos de tiempo de reloj. La perdida descendio de ~1.10 a ~1.00 de forma estable hasta el paso 2000.

El corpus de entrenamiento consta de 12 pistas (59,3 minutos, 445 clips de 8 segundos): 8 tomas vocales generadas con Suno v5 mas 4 alternativas que son arreglos genuinamente distintos, no repeticiones. El adaptador modifica exclusivamente la rama NAR del motor YuE2, que gobierna textura y timbre; la rama AR (composicion, armonia, arreglo) no se ve afectada por este LoRA y debe controlarse mediante el prompt de estilo. Se incluyen dos ficheros de pesos: uno en formato PEFT fused para ComfyUI-YuE2-Trainer (101,5 MB, con pesos EMA) y otro en formato unfused para el motor audio.cpp (66,5 MB, 392 tensores, conversion verificada byte a byte con round-trip PASS). Tambien se incluye el grafo de entrenamiento exacto en `training-workflow.json`.

## Capacidades

- Modulacion de textura y timbre musical: aplica un caracter de produccion Italo-Disco de los anos 80 sobre la salida de YuE2, incluyendo caja de ritmos four-on-the-floor, snare con gate, bajo secuenciado dominante, pads con chorus y produccion calida con agudos suaves.
- Control mediante palabra de activacion: el termino `italodisco` debe colocarse al inicio del prompt de estilo, con escala 1.0 (valor auditado).
- Compatibilidad con dos ecosistemas: formato PEFT fused para ComfyUI-YuE2-Trainer y formato unfused para el motor audio.cpp.
- No modifica composicion: no altera notas, armonia ni arreglo; esas dimensiones se controlan con el prompt de estilo o con adaptadores AR.
- Generacion de audio musical (heredada del base YuE2): el adaptador no anade capacidades generativas propias, sino que modula las del modelo base.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues de texto: es un adaptador de audio.

## Casos de uso

- Produccion musical asistida por IA con caracter retro: un compositor puede fijar el timbre Italo-Disco en la rama NAR mientras controla la composicion con el prompt de estilo, obteniendo pistas con produccion coherente sin tener que describir cada elemento sonoro en cada generacion.
- Generacion de bandas sonoras para contenido nostalgico: para videos, podcasts o juegos ambientados en los anos 80, el adaptador aporta el caracter de produccion de forma reproducible con la palabra de activacion `italodisco`.
- Prototipado rapido en ComfyUI: el fichero fused PEFT se carga directamente en ComfyUI-YuE2-Trainer, permitiendo iterar sobre prompts de estilo sin reentrenar el adaptador.
- Integracion en pipelines con audio.cpp: el fichero unfused permite desplegar el adaptador en el motor audio.cpp con nombres de capa `layers.N.nar_*` y lora_A/lora_B, verificado byte a byte.
- Experimentacion con control desacoplado composicion/produccion: investigadores pueden usar este LoRA como ejemplo de como la rama NAR de YuE2 permite separar el "que" del "como" en generacion musical, y combinarlo con adaptadores AR para controlar la armonia por separado.
- Creacion de bibliotecas de estilos musicales: el adaptador sirve como base para construir variantes de produccion (por ejemplo, correcciones de balance tonal con shelf de -3,5 dB por debajo de 250 Hz y realce de presencia) documentadas por el autor.
- Audicion y evaluacion de modelos: el flujo de audition documentado (plan layer best-of-10 + renders finalistas sobre "Let me bring you back") sirve como metodologia reproducible para evaluar adaptadores NAR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card documenta una audition cualitativa sobre la pista "Let me bring you back" (Romantic Italo, 2026-11-01) con veredicto del usuario de que el LoRA "works to get the right sounds", pero no se proporcionan metricas cuantitativas (FAD, MOS, similitud espectral ni comparaciones numericas).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el adaptador; el modelo base `yue2_3b_bf16` requiere VRAM proporcional a sus 3B parametros en bf16 (aproximadamente 6-7 GB solo pesos, mas overhead de inferencia no documentado).
- GPU recomendadas: no disponible en la informacion proporcionada. El entrenamiento se realizo en una RTX 2080 Ti de 11 GB, lo que sugiere que el adaptador es ligero, pero no se documentan requisitos de inferencia.
- Cabe en consumer GPU: el entrenamiento cupo en una RTX 2080 Ti de 11 GB; la inferencia del base en bf16 deberia caber en GPUs consumer de gama alta con al menos 8-12 GB, aunque no se confirma en la informacion.
- Opciones de despliegue: ComfyUI-YuE2-Trainer (formato fused PEFT) y motor audio.cpp (formato unfused). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a generacion musical.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jamespetts/yue2-1980s-italo-disco-lora` | LoRA NAR sobre YuE2 | no disponible (adaptador) | no disponible | CC BY-NC 4.0 | Hugging Face, 4193 descargas |
| `Comfy-Org/YuE2` (base) | Modelo generativo musical | no disponible | no disponible | no disponible en la informacion | Hugging Face (referenciado como base) |
| `m-a-p/YuE2-3B` (base original) | Modelo generativo musical | 3B | no disponible | CC BY-NC 4.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a la relacion de dependencia (el LoRA se aplica sobre el base) y a la licencia compartida con `m-a-p/YuE2-3B`.

## Limitaciones y advertencias

- Licencia no comercial: los pesos del adaptador son CC BY-NC 4.0, y al ser derivados de `m-a-p/YuE2-3B` (tambien CC BY-NC 4.0) estan sujetos a los mismos terminos no comerciales. Las salidas generadas son CC0, pero el uso comercial del adaptador o de adaptadores derivados no esta permitido.
- No es un modelo autonomo: requiere el modelo base YuE2 y un motor compatible (ComfyUI-YuE2-Trainer o audio.cpp); no puede usarse de forma aislada.
- No controla composicion: no puede cambiar notas, armonia ni arreglo; esos aspectos deben gestionarse con el prompt de estilo o con adaptadores AR.
- Balance tonal no canonico: el autor advierte que el adaptador codifica un sonido con bajo dominante y agudos suaves, no el balance seco y brillante idealizado de la practica Italo documentada de 1983; para el balance canonico hay que corregir con mastering (shelf de -3,5 dB por debajo de 250 Hz mas realce de presencia).
- Dispositivos armonicos ausentes: los recursos armonicos del corpus (bucles modales de estrofa, uso de armonica menor con V dominante, outers con dominante sostenida, v→V) no estan en el adaptador porque pertenecen a la capa de composicion; deben introducirse via prompt de estilo o adaptador AR.
- Corpus de entrenamiento limitado: 12 pistas y 445 clips de 8 segundos, todas generadas con IA (Suno v5), lo que puede limitar la diversidad y generalizacion del caracter de produccion.
- Riesgo de sobreajuste al estilo propio: el autor lo describe como "house flavour", es decir, el sonido de su propia biblioteca, no una referencia universal de Italo-Disco.
- Sin benchmarks cuantitativos: no hay metricas objetivas publicadas que permitan evaluar la fidelidad del estilo de forma reproducible.
- Advertencia tecnica de ComfyUI: el fichero `training-workflow.json` incluye una clave `_comment` que debe eliminarse antes de enviarlo a `/prompt`, ya que ComfyUI 0.42.0 la rechaza.

## Enlaces

- Hugging Face: https://huggingface.co/jamespetts/yue2-1980s-italo-disco-lora
- Modelo base Comfy-Org/YuE2: https://huggingface.co/Comfy-Org/YuE2
- Modelo base original m-a-p/YuE2-3B: https://huggingface.co/m-a-p/YuE2-3B
- Paper YuE2 (arXiv:2503.08638): https://arxiv.org/abs/2503.08638
- ComfyUI-YuE2-Trainer: https://github.com/Starnodes2024/ComfyUI-YuE2-Trainer
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/
