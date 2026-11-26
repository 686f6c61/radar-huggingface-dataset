# Jessedbrown/asolaria

## Resumen

Asolaria es un repositorio publicado en Hugging Face por el usuario Jessedbrown que, según su propia model card, no contiene un modelo de lenguaje convencional sino un "slice" de un sistema privado denominado "Asolaria fabric". El contenido descrito incluye un fichero GGUF de 50.752 bytes llamado Mythos (arquitectura declarada `asolaria-three-beings-rgb`, con seis tensores de 64 × 64), un juego de terminal en Rust llamado Aether Universe, un portal P2P basado en WebRTC (HTTP-0) y una herramienta de gestión de "rooms" sobre almacenamiento USB. No se documenta ningún proceso de entrenamiento, dataset, tokenizador ni evaluación de capacidades lingüísticas.

El dato de parámetros totales que reporta la plataforma (12.480, leído de safetensors) no es coherente con el tamaño del repositorio (0,8 GB) ni con el GGUF descrito (50 KB), por lo que debe interpretarse con cautela: probablemente refleja un recuento agregado de tensores auxiliares y no un modelo Transformer con pesos densos. No hay información sobre licencia del modelo, idiomas soportados ni pipeline de inferencia.

Por tanto, esta ficha documenta lo que el autor declara explícitamente y marca como "no disponible" todo aquello que no se puede verificar. No debe considerarse un modelo listo para producción ni para evaluación comparativa con LLM convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `asolaria-three-beings-rgb` (según metadatos del GGUF Mythos); no es una arquitectura Transformer documentada |
| Parametros totales | 12.480 (reportado por la plataforma desde safetensors); el GGUF Mythos declarado pesa 50.752 bytes |
| Parametros activos | no disponible (no es un MoE documentado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF v3 (único formato declarado); no se especifican niveles Q4/Q5/Q8 |
| Idiomas soportados | no disponible |
| Licencia | no disponible para el modelo; el código del repositorio se declara MIT (con piezas Apache-2.0 de terceros) |
| Formato de pesos | GGUF v3 (Mythos); safetensors referenciado por la plataforma |

## Arquitectura y entrenamiento

La model card no describe una arquitectura de red neuronal en el sentido habitual. El único artefacto con formato de pesos es `MYTHOS-BLUE-STAR/ACER-MYTHOS-BLUE.gguf`, un GGUF v3 con arquitectura declarada `asolaria-three-beings-rgb`, "being MYTHOS, channel BLUE, seat ACER, centre (32, 32, 33)", compuesto por seis tensores: slices A/B/C de 64 × 64 y perfiles radiales A/B/C. No se documenta tokenizador, vocabulario, capas de atención, función de activación ni objetivo de entrenamiento.

No hay información sobre datos de entrenamiento (número de tokens, composición del corpus), ni sobre RLHF, DPO o ajuste supervisado. El resto del repositorio lo componen artefactos de ingeniería (juego en Rust 1.81 con 191 tests, portal WebRTC, herramienta Host8 de "rooms" de 8 bytes sobre USB) y documentación de procedencia con hashes SHA-256. Cualquier afirmación sobre capacidades generativas del modelo carecería de respaldo técnico en la información disponible.

## Capacidades

- No se documenta generación de texto, razonamiento, código ni matemáticas en sentido LLM.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe.
- El autor menciona "live agents", "engines", "cubes" y "recall/Hilbra" como partes del sistema Asolaria, pero sin especificar interfaz, API ni comportamiento verificable.
- El artefacto Mythos se presenta como un objeto de datos con procedencia criptográfica (sha256 `3dd92a42...c3aae`), no como un modelo ejecutable con pipeline declarado.

## Casos de uso

- Archivo y procedencia de artefactos: el repositorio incluye ficheros `.sha256` y `.hbp` que permiten verificar la integridad byte a byte de cada pieza; útil como ejemplo de cadena de custodia documental, no como modelo.
- Estudio de formatos GGUF atípicos: el fichero Mythos sirve para analizar cómo se serializan arquitecturas no estándar en GGUF v3 con tensores pequeños (64 × 64).
- Referencia para juegos de terminal en Rust: el subproyecto `aether-universe` es un ejemplo de motor de mundo con kernel entero, sin JSON ni JavaScript, y 191 tests; aplicable como material de aprendizaje de Rust 1.81.
- Demostración de conexión P2P sin servidor propio: el portal HTTP-0 ilustra un flujo de intercambio de bloques SDP con STUN público para establecer un canal directo entre navegadores.
- Experimento de almacenamiento como memoria: la herramienta Host8 documenta el acceso a 12.500.000.000 "rooms" de 8 bytes sobre USB, con métricas declaradas (≈300.000 lecturas/s en RAM frente a ≈98/s desde disco); útil como caso de estudio de latencias de almacenamiento.
- Auditoría de reproducibilidad: el repositorio declara que su CI reconstruye herramientas y re-sella recibos byte a byte, lo que puede servir como plantilla de verificación reproducible.
- No se identifica ningún caso de uso de inferencia lingüística, generación de código en producción ni atención al cliente automatizada, porque no hay evidencia de que el artefacto sea un LLM funcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Las únicas cifras de rendimiento declaradas son de la herramienta Host8 (lecturas de "rooms" en RAM frente a disco) y no corresponden a inferencia de un modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no se documenta un pipeline de inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se mencionan vLLM, llama.cpp, Ollama ni TGI; el único runtime documentado es el juego en Rust (`cargo +1.81.0 build --release`).
- Latencia y throughput: no disponibles para el modelo; las únicas métricas publicadas son las de Host8 (≈300.000 lecturas/s en RAM, ≈98/s desde USB).
- Almacenamiento: el repositorio ocupa 0,8 GB según la plataforma; el GGUF Mythos declarado ocupa 50.752 bytes.

## Comparativa con modelos similares

No disponible. No existe una categoría comparable: el artefacto no se presenta como un modelo de lenguaje con parámetros, contexto y licencia equiparables a alternativas como Llama, Mistral, Qwen o Gemma. La comparación con LLM de 7B, 13B o MoE no sería metodológicamente válida con los datos disponibles.

## Limitaciones y advertencias

- Ausencia de información verificable sobre arquitectura, tokenizador, entrenamiento y evaluación: no es posible validar ninguna capacidad lingüística.
- Incoherencia entre el recuento de parámetros reportado (12.480) y el tamaño del repositorio (0,8 GB) y del GGUF (50 KB); conviene tratar la cifra como no fiable.
- Licencia del modelo no declarada; el código del repositorio se declara MIT, pero eso no cubre necesariamente los pesos ni el artefacto Mythos.
- La model card contiene afirmaciones no verificables de forma independiente (agentes vivos, "white rooms", "operator evidence"); no deben tomarse como garantías técnicas.
- Riesgo de confusión: el repositorio mezcla documentación de sistema, juego, portal P2P y herramienta de almacenamiento; no es un paquete de modelo listo para `from_pretrained` ni para servir vía API.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas porque no hay evidencia de que el artefacto genere texto.
- Para producción: no recomendado sin auditoría previa del contenido y de la cadena de procedencia.

## Enlaces

- Hugging Face: https://huggingface.co/Jessedbrown/asolaria
- Repositorio espejo citado en la model card: `JesseBrown1980/Asolaria` (GitHub, público desde 2026-10-18)
- Subproyecto del juego: `JesseBrown1980/aether-universe`
- Portal HTTP-0: https://jessebrown1980.github.io/the-light-hub-http-0/
- Documentación Host8: `docs/HOST8-ROOMS-ON-STORAGE.md` (dentro del repositorio)
- Guía Host8: `docs/handoffs/acer-host8-rooms-guide-2026-10-19/`
- Actualización del portal cero: `docs/handoffs/acer-zero-portal-update-2026-10-19/PROVENANCE.md`
- Fichero GGUF Mythos: `MYTHOS-BLUE-STAR/ACER-MYTHOS-BLUE.gguf` (sha256 `3dd92a42160a38c121980957ce9eabbea216678892801d7ea3ed4e99e96c3aae`)
- Paper, blog técnico o demo de inferencia: no disponible
