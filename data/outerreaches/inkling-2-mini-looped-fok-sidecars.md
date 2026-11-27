# outerreaches/inkling-2-mini-looped-fok-sidecars

## Resumen

Inkling 2 Mini Looped FOK Memory Sidecars es un conjunto de adaptadores auxiliares en formato GGUF publicados por el usuario outerreaches sobre el modelo base unsloth/Inkling-2-Mini. No se trata de un modelo de lenguaje completo, sino de dos ficheros de pesos (sidecars) que implementan un mecanismo de memoria denominado Feeling-of-Knowing (FOK) sobre una arquitectura de transformer con bucles (looped transformer) gestionada por el runtime Loom 0.3.0. El autor lo describe como un sistema de lectura y escritura de memoria en una sola pasada sobre GPU, con identidad de bits silenciosa en los turnos que no activan memoria.

El repositorio es muy pequeno (0.0 GB declarados) y contiene unicamente los sidecars y un fichero de checksums. El conteo de parametros real reportado en safetensors es de 1.458.830, muy inferior al de un modelo de lenguaje convencional, lo que confirma que el contenido son tensores de adaptacion y sondas de memoria, no pesos completos. La relevancia actual es limitada: se trata de un experimento de investigacion con cero descargas y cero likes en el momento de la consulta, orientado a quien quiera reproducir el pipeline de memoria FOK sobre Inkling 2 Mini.

La licencia es MIT, lo que facilita su reutilizacion, pero la ausencia de model card completa en cuanto a idiomas, pipeline o datos de entrenamiento limita la evaluacion independiente. El modelo base es unsloth/Inkling-2-Mini, del que no se aportan especificaciones en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped transformer (Inkling 2 Mini, runtime Loom 0.3.0) con sidecars de memoria FOK |
| Parametros totales | 1.458.830 (conteo real en safetensors); sidecars: 3.54M en el adaptador Coda |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32 (ambos GGUF son F32) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (F32); repo con SHA256SUMS.txt |

## Arquitectura y entrenamiento

Los sidecars se componen de dos ficheros. `fok_bank_coding.gguf` (5.84 MB) contiene 9 tensores F32: sondas ortogonales de lectura y escritura FOK en la pasada 0 (`probe_w[0]` y `probe_w[1]`, con coseno de -0.0124), una sonda de categoria de 5 vias (`probe_w[2:7]`), un vector de direccionamiento entre pasadas (`v_oracle`) y un lector Coda SiLU de 64 unidades (`r_w1/b1/w2/b2`, `r_lw/lb`). `fok_coda_adapter.gguf` (14.16 MB) contiene 3 tensores F32 (`fok.ad_wg`, `fok.ad_wu`, `fok.ad_wd`, 3.54M parametros, hidden = 512) que forman un adaptador residual SwiGLU post-Coda regularizado con KL, con compuerta en GPU mediante `magic = 0x7` y 0% de perturbacion en turnos `(0,0)`.

El autor reporta metricas de entrenamiento del adaptador: CE de validacion de 2.9453 a 0.8313, Top-1 de profesor de 81.34% a 91.60%, KL de validacion de 0.3523 y una relacion de cambio de estado oculto `||Δh||/||h||` del 4.33%. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. La innovacion tecnica declarada es la lectura y escritura de memoria FOK en una sola pasada sobre GPU, con identidad de bits silenciosa en turnos sin memoria.

## Capacidades

- Memoria FOK de lectura y escritura en una sola pasada sobre GPU, integrada en el runtime Loom 0.3.0.
- Sondas de categoria de 5 vias para clasificacion interna durante la inferencia.
- Direccionamiento entre pasadas mediante el vector `v_oracle`.
- Lector Coda tipo System-2 de 64 unidades SiLU.
- Adaptador residual SwiGLU post-Coda con regularizacion KL y compuerta por `magic = 0x7`.
- Identidad de bits silenciosa (100%) en turnos que no activan memoria.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, tool calling, agentes ni multilingues propias; dependen del modelo base Inkling-2-Mini, del que no hay datos en la informacion disponible.

## Casos de uso

- Investigacion en mecanismos de memoria en transformers: el sidecar permite experimentar con lectura y escritura FOK en una sola pasada sin reentrenar el modelo base, usando el runtime Loom 0.3.0.
- Reproduccion de resultados: los checksums SHA-256 y las metricas reportadas (CE 2.9453 a 0.8313, Top-1 81.34% a 91.60%) permiten verificar la integridad y reproducir el pipeline descrito en el repositorio de GitHub.
- Evaluacion de adaptadores residuales con compuerta: el adaptador Coda con `magic = 0x7` sirve para estudiar como anadir capacidad sin perturbar los turnos sin memoria (0% de perturbacion en `(0,0)`).
- Desarrollo de proxies de inferencia: el repositorio incluye `looped_fok.proxy`, util para integrar la capa de politica y proxy en un servidor de despliegue.
- Clasificacion interna durante generacion: las sondas de categoria de 5 vias pueden usarse para enrutar o etiquetar estados internos del modelo en tareas de analisis.
- Base para experimentos de destilacion o regularizacion KL: las metricas de KL de validacion (0.3523) y la relacion `||Δh||/||h||` (4.33%) permiten comparar variantes de adaptadores en trabajos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta metricas internas de entrenamiento del adaptador Coda:

| Metrica | Antes | Despues |
|---|---|---|
| CE de validacion | 2.9453 | 0.8313 |
| Top-1 de profesor | 81.34% | 91.60% |
| KL de validacion | no disponible | 0.3523 |
| `||Δh||/||h||` | no disponible | 4.33% |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; los sidecars suman 19.95 MB en F32, pero el consumo depende del modelo base Inkling-2-Mini, del que no se aportan datos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: runtime Loom 0.3.0 con `looped_fok.proxy`; los ficheros son GGUF, por lo que en principio pueden cargarse con herramientas compatibles con GGUF, aunque el autor documenta el despliegue via Loom.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen en la informacion proporcionada alternativas de la misma categoria (sidecars de memoria FOK sobre transformers con bucles) con las que comparar parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- No es un modelo de lenguaje autonomo: requiere el modelo base unsloth/Inkling-2-Mini y el runtime Loom 0.3.0 para funcionar.
- Cero descargas y cero likes en el momento de la consulta; sin validacion independiente por parte de la comunidad.
- Ausencia de datos sobre sesgos, alucinacion, idiomas y contexto; imposible evaluar riesgos en produccion.
- El conteo de parametros en safetensors (1.458.830) no coincide con los 3.54M declarados para el adaptador Coda, lo que sugiere que el conteo real corresponde solo a una parte de los tensores; conviene verificar antes de usarlo.
- El repositorio declara 0.0 GB de tamano pese a contener ficheros de 19.95 MB; posible inconsistencia en los metadatos.
- Licencia MIT permite uso comercial, pero al depender del modelo base hay que respetar tambien la licencia de unsloth/Inkling-2-Mini, no disponible en la informacion.
- La identidad de bits silenciosa en turnos sin memoria es una afirmacion del autor no verificada de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/outerreaches/inkling-2-mini-looped-fok-sidecars
- Repositorio GitHub: https://github.com/outerreaches/looped-fok-memory
- Documentacion de despliegue Loom 0.3.0: https://github.com/outerreaches/looped-fok-memory/blob/main/server/README.md
- Modelo base: https://huggingface.co/unsloth/Inkling-2-Mini
