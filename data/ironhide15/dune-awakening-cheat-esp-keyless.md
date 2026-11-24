# ironhide15/dune-awakening-cheat-esp-keyless

## Resumen

El repositorio `ironhide15/dune-awakening-cheat-esp-keyless` no contiene un modelo de inteligencia artificial. Se trata de un paquete distribuido a traves de Hugging Face cuyo contenido es un ejecutable de Windows (`delta-executor-pc-2026-v1.2.2-win64.exe`, version `v3.1.9`) empaquetado en un archivo ZIP de 4,8 MB protegido con contrasena. La model card se presenta como una herramienta de tipo "cheat ESP" (extra-sensorial perception) para el videojuego Dune: Awakening, con funciones declaradas de overlay externo, escaneo de offsets y suavizado de entrada.

El artefacto no incluye pesos, tokenizador, configuracion de arquitectura ni pipeline de inferencia. Los metadatos de Hugging Face (tags `windows`, `x64`, `portable`) y la ausencia de campos como `pipeline_tag` confirman que no es un modelo entrenado, sino un binario de terceros alojado en la plataforma. Cualquier evaluacion como modelo de lenguaje carece de sentido: no hay parametros, contexto ni licencia de pesos que analizar.

Esta ficha se limita a documentar lo que el repositorio declara y a advertir de los riesgos asociados. La mayor parte de los apartados obligatorios quedan marcados como "no disponible" porque no existe informacion tecnica verificable sobre un modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable de Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repo) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El contenido del repositorio es un binario compilado para Windows 10 (22H2) y Windows 11 (24H2), distribuido como `delta-executor-pc-2026-v1.2.2-win64.zip` (4,8 MB) con contrasena de descompresion `2026`. La model card describe modulos de "overlay externo a 144 Hz", "escaneo dinamico de offsets" y "suavizado de entrada bezier", que son funcionalidades propias de herramientas de trampa para videojuegos, no de un modelo generativo.

No se aporta informacion sobre dataset, tokens de entrenamiento, tecnicas de alineacion (RLHF/DPO) ni innovaciones de inferencia. La unica "innovacion" declarada es la ejecucion en modo usuario sin inyeccion de DLL, un detalle de ingenieria de software ofensivo, no de aprendizaje automatico.

## Capacidades

- No es un modelo de lenguaje: no genera texto, codigo ni razonamiento.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues reales; los codigos de idioma son etiquetas del repositorio.
- Funcionalidad declarada (no verificada): overlay ESP 2D/3D con cajas delimitadoras, esqueletos de huesos y distancia, pensado para el juego Dune: Awakening.
- Modulos declarados: perfiles JSON intercambiables en caliente, suavizado de apuntado y escaneo de offsets tras parches del juego.

## Casos de uso

- No procede: al no ser un modelo de IA, no existen casos de uso legitimos de inferencia, generacion o analisis.
- El unico uso implicito es la ejecucion del binario en un PC con Windows para obtener ventajas en un videojuego, lo que contraviene habitualmente los terminos de servicio del juego y puede conllevar el baneo de la cuenta.
- Riesgo de seguridad: ejecutar como administrador un `.exe` de origen desconocido, con contrasena en la propia pagina, es un vector clasico de malware (troyanos, stealers de credenciales, mineros).
- No se recomienda su descarga, instalacion ni integracion en ningun flujo de trabajo profesional.
- No existen escenarios de atencion al cliente, generacion de codigo, analisis de datos ni automatizacion en los que este artefacto aporte valor.
- Cualquier uso en produccion conllevaria riesgos legales y de cumplimiento, ademas de los puramente tecnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, porque el artefacto no es un modelo evaluable.

## Requisitos de hardware

- VRAM estimada: no aplica (no hay inferencia de red neuronal).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 (22H2) y Windows 11 (24H2), arquitectura x64.
- Espacio en disco: 4,8 MB para el ZIP; el tamano descomprimido no se especifica.
- Opciones de despliegue: ninguna estandar (vLLM, llama.cpp, Ollama, TGI no aplican).
- Latencia y throughput: no disponibles; la model card menciona "< 15 ms de respuesta" y "< 21 MB de RAM" para modulos concretos, pero son cifras del autor sin verificacion independiente.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no pertenece a la categoria de modelos de IA. Frente a herramientas de trampa para videojuegos, la comparacion queda fuera del alcance de esta ficha y no se dispone de datos verificables de alternativas.

## Limitaciones y advertencias

- No es un modelo de IA: no debe citarse ni evaluarse como tal en ningun contexto tecnico o academico.
- Riesgo alto de malware: binarios de este tipo, distribuidos con contrasena y alojados en repositorios de terceros, se asocian con frecuencia a software malicioso.
- La licencia MIT declarada en metadatos no garantiza la legalidad ni la seguridad del contenido; la licencia cubre el texto del repositorio, no la confianza en el ejecutable.
- Uso contrario a los terminos de servicio de Dune: Awakening y potencialmente a la legislacion de proteccion de consumidores y de ciberseguridad segun la jurisdiccion.
- Sin auditoria, sin firma de codigo verificable y sin trazabilidad del autor (`ironhide15`).
- Cero descargas y cero likes en el momento de la consulta, lo que impide cualquier validacion por parte de la comunidad.
- No apto para produccion, investigacion ni entornos corporativos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ironhide15/dune-awakening-cheat-esp-keyless
- Repositorio GitHub citado en la model card: https://github.com/Chavez46/dune-awakening-cheat-esp-keyless
- Repositorio GitHub del binario: https://github.com/dawidb9567/delta-executor-pc-2026
- Enlace de descarga directa citado (no recomendado): https://github.com/dawidb9567/delta-executor-pc-2026/releases/download/v1.2.0/delta-executor-pc-2026-v1.2.2-win64.zip
