# REDSOULTM/BAXY-Qwen3.5-4B-GGUF

## Resumen

BAXY-Qwen3.5-4B-GGUF es la versión cuantizada en formato GGUF del modelo que da soporte a BAXY, un asistente de voz local para Windows desarrollado por REDSOULTM. Se trata de un ajuste fino mediante LoRA sobre Qwen/Qwen3.5-4B, fusionado y posteriormente cuantizado a Q4_K_M, con un total de 4.205.751.296 parámetros. El modelo está diseñado específicamente para actuar como agente que decide invocando herramientas: abre aplicaciones, navega ventanas, gestiona archivos, busca en la web y controla el sistema, verificando el resultado de cada acción antes de comunicarlo al usuario.

El problema que resuelve es la orquestación fiable de acciones sobre el escritorio de Windows en un entorno completamente local y privado, sin dependencia de servicios en la nube. Frente a modelos generalistas, este ajuste enseña al modelo a leer los recibos que devuelve la aplicación (qué ocurrió realmente), a pedir confirmación antes de acciones destructivas y a declarar explícitamente cuándo no puede confirmar un resultado, reduciendo los falsos éxitos.

Es relevante ahora porque demuestra que un modelo de 4B parámetros, cuantizado a 2,74 GB y ejecutable en una GPU de 4 GB de VRAM con llama.cpp, puede sostener un agente de control de escritorio con métricas de éxito verificadas en un banco ciego de 160 misiones sobre 15 aplicaciones reales. La licencia Apache 2.0 y el soporte de español e inglés lo hacen directamente desplegable en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B); no se detalla la variante interna |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de llama-server con `-c 32768`) |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado: `BAXY-Qwen3.5-4B-c4-Q4_K_M.gguf`, 2,74 GB); version anterior c3 tambien en Q4_K_M |
| Idiomas soportados | Espanol e ingles (y mezclas de ambos) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de 4B parámetros, sobre el que se aplica un ajuste fino LoRA (ciclo c4, brazo c4c2, semilla A) que posteriormente se fusiona con los pesos base y se cuantiza a GGUF Q4_K_M. El entrenamiento emplea conversaciones sintéticas con recibos de trazas reales de la aplicación BAXY, es decir, pares de decisión de herramienta, argumentos y resultado observado. Las respuestas aceptadas fueron evaluadas por jueces a ciegas, con la excepción de 105 ejemplos de «Guardar como» añadidos en el ciclo c4, construidos a partir de trayectorias ya aceptadas (se modifican la petición y la respuesta esperada, manteniendo vistas y recibos) y que entran dos veces en el dataset.

El conjunto de datos no incluye texto privado de ninguna persona y todas las familias pasaron un control de fuga contra los bancos de evaluación. De los 105 ejemplos añadidos, ninguno se asemeja a las peticiones del banco ciego, y 7 comparten frases genéricas con otros bancos que no se usaron para decidir. El ajuste se orienta a cuatro comportamientos: selección correcta de herramienta y argumentos, lectura fiel de los recibos, solicitud de confirmación ante acciones destructivas y respuestas breves y naturales en el idioma del usuario. Para la capacidad de visión (clic sobre elementos visibles en pantalla), BAXY utiliza además el proyector `mmproj` de Qwen3.5-4B ejecutándose en CPU.

## Capacidades

- Generación de texto conversacional breve y natural, en español, inglés o mezcla de ambos.
- Tool calling y function calling: selección de herramienta y construcción de argumentos para operar Windows y sus aplicaciones.
- Control de escritorio (computer use): apertura de aplicaciones, navegación de ventanas, gestión de archivos, búsqueda web, control de música y del sistema.
- Verificación de resultados: interpretación de los recibos devueltos por la aplicación para no afirmar más de lo ocurrido.
- Gestión de confirmaciones: solicitud de confirmación antes de acciones destructivas y declaración explícita de incapacidad.
- Comportamiento de agente multi-paso dentro del bucle de BAXY (decidir, ejecutar, leer recibo, responder).
- Capacidad de visión delegada al proyector `mmproj` de Qwen3.5-4B (clic sobre lo que se ve en pantalla), ejecutado en CPU.
- Soporte multilingüe limitado a español e inglés.

## Casos de uso

- Asistente de voz local para Windows: el modelo recibe el prompt de sistema, el catálogo de herramientas y los recibos de BAXY, y decide la siguiente acción; encaja por su entrenamiento específico en el bucle decidir-ejecutar-verificar y por caber en 4 GB de VRAM.
- Automatización de tareas de escritorio con verificación: abrir una aplicación, navegar a una ventana concreta y confirmar el estado final leyendo el recibo, lo que permite pipelines de automatización con control de resultado en lugar de ejecución a ciegas.
- Gestión de archivos con confirmación: operaciones de guardado, movimiento o renombrado donde el modelo pide confirmación antes de lo destructivo y reporta la ruta real devuelta por el recibo, adecuado para entornos donde un error de ruta es costoso.
- Asistente de privacidad estricta: al ejecutarse completamente offline con llama.cpp, sirve para organizaciones que no pueden enviar comandos ni rutas de archivo a servicios en la nube.
- Integración en herramientas de agente propias: servir el GGUF con `llama-server -c 32768 --jinja` y conectar un catálogo de herramientas propio compatible con function calling, reutilizando el estilo breve y la disciplina de recibos del ajuste.
- Búsqueda web y control multimedia por voz: el modelo elige la herramienta de búsqueda o de control de reproducción y responde en una frase con el resultado confirmado, útil en asistentes de sobremesa con micrófono siempre activo.
- Despliegue en hardware de gama baja: con 2,74 GB de pesos Q4_K_M y 4 GB de VRAM, es viable en portátiles y equipos sin GPU dedicada de alta gama para prototipos de agentes de escritorio.

## Benchmarks y rendimiento

Los resultados publicados corresponden a un banco ciego de 160 misiones difíciles en 15 aplicaciones de escritorio, ejecutadas 3 veces por brazo de punta a punta con BAXY real sobre Windows real y juzgadas a ciegas.

| Metrica | c2 | c3 | c4 (este modelo) |
|---|---|---|---|
| Misiones logradas (mayoría de 3) | 36 / 160 | 44 / 160 | 58 / 160 |
| Logradas en las 3 corridas | 24 | 38 | 50 |
| Límite honesto (mayoría) | 51 | 51 | 59 |
| Éxitos falsos por mayoría | 11 | 11 | 8 (5,0 %) |
| Corridas con éxito falso | 37 de 480 | 35 de 480 | 29 de 479 |

Prueba de McNemar por misión frente a c3: en misiones logradas, 14 ganadas y 0 perdidas (p = 0,0001); en éxitos falsos, 3 nuevos y 6 eliminados (p = 0,508, diferencia no significativa). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4 GB con la cuantización Q4_K_M (2,74 GB de pesos más overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, según el autor, en una GPU de 4 GB de VRAM con llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-server -m BAXY-Qwen3.5-4B-c4-Q4_K_M.gguf -c 32768 -ngl 99 --jinja`); el autor no menciona vLLM, Ollama ni TGI.
- Visión: requiere el proyector `mmproj` de Qwen3.5-4B ejecutado en CPU.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| BAXY-Qwen3.5-4B (c4) | 4,2B | 32.768 | Apache 2.0 | GGUF Q4_K_M | Agente de control de escritorio Windows |
| Qwen/Qwen3.5-4B (base) | 4,2B | no disponible | Apache 2.0 | safetensors (y derivados) | Modelo generalista |
| BAXY-Qwen3.5-4B (c3) | 4,2B | 32.768 | Apache 2.0 | GGUF Q4_K_M | Versión anterior del mismo ajuste |

No se dispone de datos de benchmarks comparativos frente a otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de 4B: falla en interfaces que no conoce y en peticiones largas de muchos pasos.
- Puede afirmar algo falso: en el banco ciego, 8 de 160 misiones (5,0 %) terminan por mayoría en un éxito falso. En una prueba repetida de «Guardar como» con el diálogo abierto en otra carpeta, de 10 pasadas: 5 correctas, 4 fallos declarados con honestidad y 1 en la que guardó en la carpeta equivocada afirmando que estaba en la solicitada, pese a que el recibo indicaba otra cosa. Son muestras pequeñas.
- La medición es mixta: de las 124 misiones de c4 ejecutadas en máquinas virtuales de Azure con Windows Server, 39 se repitieron en un portátil físico y 85 siguen siendo de máquina virtual; las otras 36 son de PC físicos. Solo se repitieron las misiones afectadas, lo que puede favorecer a c4 en la comparación por misión.
- c2 y c3 se midieron el 31-10-2026 con otra versión de la aplicación, y c4 con una más nueva, por lo que la mejora no puede atribuirse íntegramente al modelo.
- Falta 1 de las 480 corridas de c4 (la preparación falló); las otras dos de esa misión resultaron logradas.
- Fuera de BAXY, sin sus herramientas y recibos, se comporta como un Qwen3.5-4B con un estilo más breve.
- Idiomas limitados a español e inglés; no se documenta cobertura de otros idiomas.
- Licencia Apache 2.0 permite uso comercial; el código de BAXY es MIT. No se documentan sesgos específicos en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/REDSOULTM/BAXY-Qwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de BAXY: https://github.com/REDSOULTM/BAXY
- Sitio web: https://baxy.app
