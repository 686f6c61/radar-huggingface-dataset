# FahadPrimeX/FahadPrimeX-b27-V3-GGUF

## Resumen

FahadPrimeX-b27-V3-GGUF es la distribucion cuantizada en formato GGUF del modelo FahadPrimeX-b27-V3, publicado por el usuario FahadPrimeX en Hugging Face. Se trata de un modelo de 26.895.998.464 parametros (aproximadamente 26,9 mil millones) especializado en generacion de codigo para Three.js, con soporte declarado de tres idiomas (arabe, ingles y chino) y licencia Apache 2.0. El repositorio incluye tres cuantizaciones: Q4_K_M (16,5 GB), Q5_K_M (19,2 GB) y Q6_K (22,1 GB), con un tamano total de repositorio de 115,7 GB.

La relevancia del modelo radica en su enfoque vertical: no es un asistente generalista, sino un modelo ajustado especificamente para producir escenas 3D y aplicaciones WebGL con Three.js, ejecutable en local mediante llama.cpp, Ollama o LM Studio. Segun la propia model card, el modelo desciende del linaje Qwen3.8-27B y hereda de el una arquitectura hibrida de 64 capas que combina 48 capas de atencion lineal de estilo DeltaNet (recurrencia de memoria constante) con 16 capas de atencion completa (una de cada cuatro).

La model card incluye una evaluacion honesta y poco habitual en la que el autor reconoce que esta version V3 empeora el rendimiento global de generacion de juegos respecto a su punto de partida (50,9% frente a 54,5% en 32 tareas de validacion propietarias) y que su mejora real se limita a la identidad multilingue. Es, por tanto, un modelo experimental de nicho, con 81 descargas y sin evaluaciones independientes publicas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido de 64 capas: 48 capas de atencion lineal (DeltaNet, recurrencia de memoria constante) intercaladas con 16 capas de atencion completa (una de cada cuatro), mas una capa MTP/nextn de borrador excluida de los GGUF |
| Parametros totales | 26.895.998.464 (aproximadamente 26,9 B) |
| Parametros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (16,5 GB), Q5_K_M (19,2 GB), Q6_K (22,1 GB) |
| Idiomas soportados | Arabe (ar), ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones para llama.cpp); el modelo base del que derivan no especifica formato en la informacion disponible |

## Arquitectura y entrenamiento

La arquitectura se describe en la model card como heredada de Qwen3.8-27B: un diseno hibrido de 64 capas en el que 48 capas emplean atencion lineal de tipo DeltaNet con recurrencia de memoria constante, intercaladas con 16 capas de atencion completa que aparecen cada cuatro capas. Esta combinacion busca reducir el coste de memoria del cache de claves y valores en contextos largos sin renunciar por completo a la atencion cuadratica clasica. Adicionalmente, el modelo original incluye una capa MTP/nextn (multi-token prediction) usada como capa de borrador; el autor la excluye de las exportaciones GGUF mediante el flag `--no-nextn` para que el parametro `block_count` coincida con los 64 bloques reales.

No se proporcionan datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso concreto de RLHF o DPO en la informacion disponible. La model card menciona una fase de RLVR (reinforcement learning con recompensas verificables) entre el modelo base pre-RLVR (V2) y esta version V3, y anuncia un run V3.1 con recompensas ponderadas por "hard gates" desde la ronda cero. El ajuste declarado se centra en generacion de codigo Three.js y en la identidad del modelo: segun la propia documentacion, V3 corrige la identidad trilingue (10/10) pero no mejora la calidad de generacion de juegos respecto al punto de partida.

## Capacidades

- Generacion de codigo especializado en Three.js: escenas 3D, geometria, materiales, iluminacion, camaras, animaciones y controles de interaccion en el navegador.
- Generacion de texto conversacional en formato chat (el repositorio esta etiquetado como `conversational`).
- Soporte multilingue declarado en arabe, ingles y chino, incluida una identidad coherente en los tres idiomas ("I am FahadPrimeX (b27), a Three.js-specialist model" y su equivalente en arabe).
- Capacidad de generar aplicaciones web interactivas con render, controles y activacion mediante un solo clic, segun el protocolo de validacion descrito por el autor.
- Compatibilidad con endpoints en formato OpenAI (`endpoints_compatible`), lo que facilita su integracion en clientes que hablan ese protocolo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de escenas Three.js en local: el modelo puede producir el codigo completo de una escena 3D (geometria, materiales, luces y camara) ejecutable en el navegador, y su formato GGUF permite hacerlo en una maquina con GPU de gama alta sin enviar codigo a servicios externos.
- Prototipado rapido de visualizaciones 3D en estudios y agencias: dado que las cuantizaciones Q4_K_M y Q5_K_M caben en GPUs de 24 GB, un equipo puede generar borradores de dashboards o productos 3D configurables sin coste por token ni dependencia de API.
- Asistente de codigo integrado en el IDE: sirviendolo con `llama-server` o mediante un endpoint compatible con OpenAI, se puede conectar a editores o plugins que consuman esa interfaz y usarlo como autocompletado especializado en WebGL y Three.js.
- Material didactico y docencia de graficos por computador: el modelo puede generar ejemplos progresivos de Three.js y explicarlos en ingles, arabe o chino, lo que resulta util en aulas con alumnado multilingue.
- Migracion y mantenimiento de codigo Three.js heredado: el modelo puede reescribir fragmentos obsoletos, reorganizar la jerarquia de escena o adaptar ejemplos de tutoriales a la version actual de la libreria, aprovechando su especializacion frente a modelos generalistas.
- Entornos con requisitos de privacidad o sin conectividad: al ejecutarse con llama.cpp u Ollama sobre pesos locales, es apto para entornos air-gapped, defensa o industrias reguladas donde no se permite enviar codigo propietario a terceros.
- Soporte a equipos distribuidos en Oriente Medio y Asia: la cobertura declarada de arabe y chino permite que las explicaciones y los comentarios del codigo generado se produzcan en el idioma de cada desarrollador.

## Benchmarks y rendimiento

Los unicos datos disponibles son los publicados por el propio autor, medidos sobre 32 tareas reservadas con un validador de navegador y un protocolo propios. No son comparables con benchmarks estandar como MMLU, HumanEval o GSM8K, y no se han publicado resultados en dichos benchmarks en la informacion disponible.

| Modelo | Resultado global | Hard gates (render / controles / un clic) | Identidad (3 idiomas) |
|---|---|---|---|
| Base pre-RLVR (V2) | 54,5% | 8/32 | 0/10 (responde "Qwen") |
| FahadPrimeX-b27-V3 (este modelo) | 50,9% | 4/32 | 10/10 |

Segun la model card, V3 no mejora la calidad de generacion de juegos respecto a su punto de partida y solo corrige por completo la identidad trilingue. Estan previstos runs posteriores (V3.1) con recompensas ponderadas por hard gates.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas cache y sobrecarga de runtime):
  - Q4_K_M (16,5 GB de pesos): aproximadamente 18-20 GB de VRAM con contexto moderado.
  - Q5_K_M (19,2 GB de pesos): aproximadamente 21-23 GB de VRAM.
  - Q6_K (22,1 GB de pesos): aproximadamente 24-26 GB de VRAM.
- GPU recomendadas: A100 40 GB o 80 GB, H100, L40S 48 GB; en gama de consumo, RTX 4090 o RTX 3090 (24 GB) para Q4_K_M y Q5_K_M, y RTX 5090 (32 GB) para Q6_K con holgura.
- Compatibilidad con GPU de consumo: Q4_K_M y Q5_K_M caben en tarjetas de 24 GB; en GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) no caben completas y requieren descarga parcial a CPU o RAM, con la penalizacion de velocidad correspondiente. No se publican cuantizaciones de 8 bits ni Q3, lo que limita las opciones en equipos pequenos.
- Opciones de despliegue: llama.cpp y `llama-server`, Ollama (comando `ollama run hf.co/FahadPrimeX/FahadPrimeX-b27-V3-GGUF:FahadPrimeX-b27-V3-Q4_K_M`), LM Studio y servidores compatibles con el protocolo de OpenAI. vLLM soporta GGUF de forma parcial; TGI no ofrece soporte nativo de GGUF.
- Latencia y throughput estimados: no disponible.
- Almacenamiento: el repositorio completo ocupa 115,7 GB, aunque basta con descargar el fichero de la cuantizacion elegida (entre 16,5 y 22,1 GB).

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de contexto, benchmarks estandar ni licencia de modelos alternativos, por lo que no es posible establecer una comparativa cuantitativa fiable con otras alternativas de la misma categoria. La unica comparacion documentada es interna, contra el propio punto de partida del autor.

| Modelo | Parametros | Contexto | Rendimiento (protocolo del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FahadPrimeX-b27-V3-GGUF | 26,9 B | No disponible | 50,9% global; 10/10 identidad | Apache 2.0 | GGUF en Hugging Face; 81 descargas |
| FahadPrimeX-b27-V3 (base pre-RLVR, V2) | No disponible | No disponible | 54,5% global; 0/10 identidad | No disponible | Referenciado en la model card, no publicado como repositorio independiente en la informacion disponible |
| Otros modelos especializados en generacion de codigo de ~27 B | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Regresion declarada por el propio autor: V3 obtiene peor resultado global que su punto de partida (50,9% frente a 54,5%) y reduce los hard gates superados de 8/32 a 4/32. No debe asumirse que sea mejor que V2 en calidad de codigo.
- Evaluacion muy limitada: los unicos resultados disponibles provienen de un protocolo propietario de 32 tareas con validador de navegador, no de benchmarks estandarizados ni de evaluacion por terceros.
- Riesgo de alucinacion en API: al ser un modelo especializado en una libreria concreta, puede inventar metodos, propiedades o parametros de Three.js que no existen en la version objetivo. Requiere validacion ejecutando el codigo generado.
- Identidad reforzada artificialmente: el ajuste de identidad es explicito y trilingue, y el modelo afirma ser "FahadPrimeX (b27)". Esto puede producir respuestas auto-referenciales poco fiables sobre su propio origen, capacidades o limitaciones.
- Cobertura idiomatica reducida: solo se declaran arabe, ingles y chino. No hay soporte declarado de castellano, lo que limita su uso directo en documentacion o conversaciones en espanol.
- Longitud de contexto desconocida: no se publica la ventana de contexto soportada, un dato critico para decidir su uso en tareas de refactorizacion sobre ficheros grandes.
- Licencia y trazabilidad: el repositorio GGUF se distribuye bajo Apache 2.0, pero el modelo declara descender de Qwen3.8-27B. Conviene verificar las condiciones de la licencia del modelo base antes de un uso comercial, ya que la informacion proporcionada no las detalla.
- Soporte de agentes y tool calling no confirmado: no hay evidencia en la informacion disponible de que el modelo soporte function calling, lo que impide recomendarlo para pipelines de agentes sin una prueba previa.
- Madurez baja: 81 descargas, 0 likes y un unico ciclo de actualizacion (creado y actualizado el mismo dia, 21 de septiembre de 2026). No hay historial de mantenimiento ni comunidad que reporte fallos.
- Cuantizaciones limitadas: la ausencia de variantes Q3 o de 8 bits dificulta el despliegue en GPUs de menos de 16 GB.

## Enlaces

- Modelo en Hugging Face (GGUF): https://huggingface.co/FahadPrimeX/FahadPrimeX-b27-V3-GGUF
- Modelo base declarado: https://huggingface.co/FahadPrimeX/FahadPrimeX-b27-V3
- Perfil del autor: https://huggingface.co/FahadPrimeX
- Busqueda web: no se ha encontrado ningun resultado relevante sobre este modelo, su paper, su repositorio de codigo o demos. Los unicos resultados devueltos corresponden a la libreria Python tksheet (https://github.com/ragardner/tksheet), sin relacion alguna con el modelo.
