# Chandrasekar/Qwen3.5-4B-GLB-3D-Coder-Sirpi-MLX-4bit

## Resumen

Qwen3.5-4B-GLB-3D-Coder · Sirpi tune (MLX 4-bit) es un ajuste fino mediante LoRA del modelo ccore/Qwen3.5-4B-GLB-3D-Coder, que a su vez deriva de Qwen/Qwen3.5-4B. Lo publica el desarrollador independiente Chandrasekar y su proposito es generar, en una sola peticion, un archivo HTML autonomo con Three.js que renderiza un activo 3D y ofrece un boton de exportacion a GLB. El modelo esta empaquetado en formato MLX de 4 bits para Apple Silicon, con un peso aproximado de 2,4 GB y 4.205.751.296 parametros totales.

La especializacion del ajuste es doble: activos de videojuego para motores como Godot y objetos destinados a impresion 3D FDM en impresoras tipo Bambu Lab. Respecto al modelo base, el autor reporta mejoras en la tasa de exito de extremo a extremo, mayor precision en el tamano fisico solicitado y una reduccion de aproximadamente la mitad en los tokens generados por activo, lo que se traduce en tiempos de generacion mas cortos.

El modelo forma parte del ecosistema de la aplicacion Sirpi, una app macOS de codigo abierto que lo descarga en el primer arranque y lo ejecuta localmente en la GPU del equipo, sin enviar datos a la nube. La licencia es Apache 2.0, la misma que la del modelo base. El unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), ajuste fino LoRA fusionado y cuantizado; no disponible el detalle exacto de capas y atencion |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits MLX, group size 64 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer de 4B parametros, y hereda el ajuste de ccore/Qwen3.5-4B-GLB-3D-Coder, orientado a generar HTML con Three.js. Sobre esa base, el autor aplica un proceso de autodestilacion con verificacion y sin datos externos: el modelo base genero tres respuestas por cada uno de 146 prompts de activos de juego y seis por cada uno de 96 prompts de impresion, lo que suma 1.014 respuestas. Cada respuesta se ejecuto en un navegador headless y se valido (carga de pagina, ausencia de errores de script, exportacion de GLB); las de impresion se puntuaron ademas por precision de tamano, pieza unica conectada, superficies cerradas y base plana. Se conservo la mejor respuesta valida por prompt, lo que dio 129 ejemplos de entrenamiento y 12 de validacion.

El ajuste se realizo con LoRA en todas las capas lineales, con rango 16, escala 8, learning rate 5e-5 con decaimiento coseno, 258 iteraciones y enmascaramiento del prompt. Los adaptadores se fusionaron en los pesos bf16 y despues se cuantizaron a 4 bits con group size 64. El resultado se distribuye en formato MLX para Apple Silicon. No se documentan innovaciones de decodificacion especulativa ni mecanismos de atencion alternativos.

## Capacidades

- Generacion de texto y codigo orientado a un dominio muy concreto: archivos HTML autonomos con Three.js.
- Creacion de activos 3D de baja poligonizacion para motores de juego, con exportacion a GLB compatible con Godot.
- Generacion de geometria para impresion 3D FDM: dimensiones reales en milimetros, pieza unica fusionada, base plana en y = 0, paredes de al menos 2 mm y voladizos preferentemente por debajo de 45 grados.
- Animacion opcional de activos cuando la peticion la requiere, incluida en el GLB exportado.
- Generacion de escenas completas, segun la descripcion de la app Sirpi.
- Iteracion conversacional: la app permite seleccionar una parte del modelo y pedir cambios, manteniendo un historial de versiones por activo.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no documentadas en el modelo; la orquestacion de agentes la realiza la aplicacion Sirpi, no el modelo.
- Capacidades multilingues: solo ingles.
- Capacidades de vision, audio o modo de razonamiento explicito: no disponibles.

## Casos de uso

- Generacion de activos para videojuegos en Godot: el modelo produce un HTML con Three.js que renderiza el objeto y exporta un GLB listo para importar en el editor, con animacion incluida si se solicita. Es adecuado por su system prompt especifico y por la validacion de exportacion GLB durante el ajuste.
- Preparacion de piezas para impresion 3D FDM: a partir de una descripcion en lenguaje natural, genera geometria a escala real en milimetros con base plana y paredes de 2 mm o mas, pensada para laminadores de impresoras Bambu Lab de 256 mm de placa.
- Iteracion sobre un activo existente: en Sirpi se puede seleccionar una parte del modelo y pedir un cambio concreto, lo que aprovecha la capacidad conversacional del modelo y el historial de versiones por activo.
- Prototipado rapido de utillaje domestico: por ejemplo, un soporte de movil a 60 grados y 80 mm de ancho, con dimensiones verificables en la propia pagina generada.
- Flujo local y privado en macOS: al ejecutarse con MLX en la GPU del Mac, permite generar activos sin enviar prompts ni imagenes a servicios externos, algo relevante para estudios con material confidencial.
- Generacion de escenas completas para previsualizacion: util para maquetas rapidas de entornos antes de modelar en detalle en una herramienta DCC.
- Integracion en pipelines asistidos por agentes: la app puede delegar en agentes de codigo ya existentes (Claude Code, Codex, Gemini CLI y otros) o en APIs en la nube, usando este modelo como generador local cuando se prioriza privacidad o coste.

## Benchmarks y rendimiento

Evaluacion del autor sobre 50 prompts reservados (30 de juego, 20 de impresion), una muestra por prompt, temperatura 0.8, ambos modelos en MLX de 4 bits.

| Prompts de impresion (20) | Base | Este modelo |
|:---|---:|---:|
| Funciona de extremo a extremo (carga, sin errores, GLB valido) | 55% | 80% |
| GLB exportado | 60% | 85% |
| Puntuacion de impresion (0-100, fallos cuentan como 0) | 39,1 | 55,0 |
| Tamano dentro del 30% de lo solicitado | 10% | 40% |
| Pieza unica conectada | 45% | 55% |
| Superficies cerradas (media) | 0,97 | 0,90 |
| Tokens de salida medios | 12.786 | 5.233 |

| Prompts de juego (30) | Base | Este modelo |
|:---|---:|---:|
| Funciona de extremo a extremo | 63% | 70% |
| Sin errores de script | 80% | 70% |
| Tokens de salida medios | 12.550 | 6.337 |

El autor advierte que, con una sola muestra por prompt, las cifras son ruidosas y deben interpretarse como una orientacion. La velocidad de generacion por token no cambia (unos 150 tokens/s en lote en un Mac de la serie M); los activos terminan antes porque son mas cortos. Catorce prompts que fallaban antes ahora funcionan y siete que funcionaban ahora fallan.

## Requisitos de hardware

- VRAM o memoria unificada: el repositorio ocupa 2,4 GB en 4 bits; se necesita memoria unificada suficiente para el modelo mas el contexto de generacion, con salidas de hasta 16.000 tokens configuradas en el ejemplo de uso.
- Plataforma: exclusivamente Apple Silicon mediante MLX; no esta pensado para GPU NVIDIA ni CUDA.
- GPU recomendadas: chips de la serie M de Apple; no se especifica un minimo de generacion.
- Cabe en GPU de consumo: si, en Macs con Apple Silicon, que es el unico objetivo soportado.
- Opciones de despliegue: mlx-lm (comando `mlx_lm.generate`), la aplicacion Sirpi para macOS y, en general, herramientas compatibles con MLX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 150 tokens/s en lote en un Mac de la serie M, segun el autor; con salidas medias de 5.233 a 6.337 tokens, cada activo se completa en decenas de segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (Sirpi tune, MLX 4-bit) | 4,2B | no disponible | HTML Three.js con exportacion GLB; juego e impresion 3D | Apache 2.0 | MLX safetensors 4 bits |
| ccore/Qwen3.5-4B-GLB-3D-Coder | 4B (no confirmado) | no disponible | Mismo dominio, sin el ajuste de impresion ni la reduccion de tokens | Apache 2.0 (segun el modelo base) | no disponible |
| Qwen/Qwen3.5-4B | 4B (no confirmado) | no disponible | Modelo fundacional de proposito general | Apache 2.0 (segun el autor) | no disponible |

No se dispone de datos de benchmarks de los modelos base y fundacional comparables mas alla de las cifras relativas publicadas por el autor en la seccion anterior.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Dominio muy restringido: esta entrenado para generar HTML con Three.js y GLB; fuera de ese formato su utilidad no esta documentada.
- El autor reconoce una debilidad conocida: los activos de juego presentan errores de script con algo mas de frecuencia que el modelo base (70% sin errores frente a 80%). Recomienda reintentar o devolver el error al modelo.
- Las superficies cerradas empeoran ligeramente respecto al base (0,90 frente a 0,97), lo que puede afectar a la estanqueidad de las mallas para impresion.
- La evaluacion se hizo con una sola muestra por prompt, por lo que las metricas tienen alta varianza y no deben tomarse como medidas precisas.
- Riesgo de alucinacion geometrica: el modelo puede producir piezas que no cumplen las restricciones fisicas solicitadas (tamano, fusion, voladizos), como refleja el 40% de acierto en tamano dentro del 30%.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y se trata de un ajuste independiente, no de una version oficial de CCORE ni del equipo Qwen.
- Dependencia de plataforma: al estar en formato MLX, no es desplegable en infraestructura CUDA sin conversion previa.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chandrasekar/Qwen3.5-4B-GLB-3D-Coder-Sirpi-MLX-4bit
- Modelo base: https://huggingface.co/ccore/Qwen3.5-4B-GLB-3D-Coder
- Modelo fundacional: https://huggingface.co/Qwen/Qwen3.5-4B
- Aplicacion Sirpi (repositorio): https://github.com/chandrasekar-r/sirpi
- Descarga de Sirpi para macOS: https://github.com/chandrasekar-r/sirpi/releases/latest
- Libreria de ajuste fino mlx-lm: https://github.com/ml-explore/mlx-lm
