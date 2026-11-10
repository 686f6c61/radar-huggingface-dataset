# islamII3620/NeighborAGI

## Resumen

NeighborAGI no es un modelo de lenguaje en el sentido convencional, sino una aplicacion de escritorio para Windows distribuida a traves de Hugging Face por el usuario islamII3620. El repositorio contiene unicamente los binarios de instalacion (`NeighborAGI-Setup-x64.exe`) y los metadatos de actualizacion (`latest.json` y su firma Ed25519), con un tamano total de 0,2 GB. No se publican pesos, arquitectura ni informacion sobre el modelo subyacente.

La aplicacion se presenta como un "companion on the desktop" con soporte para ingles y arabe, y se distribuye como software propietario bajo un EULA propio. El codigo fuente no es publico y el repositorio no incluye model card tecnica, ficha de arquitectura ni resultados de evaluacion. Por tanto, no es posible verificar que modelo, en su caso, ejecuta la aplicacion ni con que parametros.

Desde el punto de vista de evaluacion tecnica, la ficha se limita a documentar lo que el autor publica explicitamente: requisitos de plataforma, mecanismo de actualizacion firmada y naturaleza propietaria del binario. Cualquier dato sobre parametros, contexto, cuantizacion o entrenamiento debe considerarse no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ar |
| Licencia | other (EULA propietario de NeighborAGI) |
| Formato de pesos | no disponible (el repositorio contiene un instalador `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo ni sobre el proceso de entrenamiento. La model card no menciona transformer, MoE, SSM ni ninguna otra familia arquitectonica, ni tampoco volumen de tokens, composicion del dataset o tecnicas de alineacion como RLHF o DPO.

Lo unico documentado a nivel tecnico es el sistema de distribucion y actualizacion: cada release incluye `latest.json` con el tamano y el SHA-256 del instalador y de la actualizacion, acompanado de `latest.json.sig`, una firma Ed25519 generada con la clave de release de NeighborAGI. La aplicacion verifica ambos antes de instalar cualquier actualizacion. El instalador no requiere privilegios de administrador y la aplicacion se autoactualiza en el primer arranque y cuando hay version nueva.

## Capacidades

- La model card no enumera capacidades funcionales del modelo subyacente (generacion de texto, razonamiento, codigo, matematicas, vision, etc.).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Idiomas declarados en los metadatos: ingles y arabe.
- Se describe como asistente de escritorio ("desktop assistant") para Windows, pero sin detallar que tareas cubre.
- No se documentan modos especiales (thinking, vision, audio) ni API publica.

## Casos de uso

- Asistencia de escritorio en Windows: la aplicacion se instala como ejecutable x64 en Windows 10 (1809) o Windows 11 y se ejecuta sin privilegios de administrador, lo que facilita su despliegue en equipos corporativos con politicas restrictivas.
- Entornos con actualizacion gestionada: el mecanismo de autoactualizacion firmada con Ed25519 y verificacion SHA-256 permite mantener la aplicacion al dia sin intervencion manual del usuario.
- Usuarios araboparlantes en escritorio: al declarar soporte de ingles y arabe, puede orientarse a flujos de trabajo bilingues, aunque no se detalla el alcance real del soporte linguistico.
- Verificacion de integridad en despliegues: el hash SHA-256 publicado en `latest.json` permite validar el instalador antes de distribuirlo en una flota de equipos mediante PowerShell (`Get-FileHash`).
- Evaluacion de software propietario empaquetado en Hugging Face: util para equipos que auditan la procedencia y el modelo de licencia de artefactos binarios antes de adoptarlos.
- Distribucion interna controlada: al no requerir permisos de administrador, encaja en escenarios de instalacion por usuario en estaciones de trabajo gestionadas por TI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Plataforma: Windows 10 version 1809 o Windows 11, 64 bits.
- Arquitectura del instalador: x64.
- Permisos: no requiere privilegios de administrador.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: instalador `.exe` autoactualizable; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.
- Espacio en disco: el repositorio ocupa 0,2 GB; el tamano instalado no se especifica.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre el modelo subyacente (parametros, contexto, rendimiento) que permita compararlo con alternativas de la misma categoria. Ademas, NeighborAGI se distribuye como aplicacion de escritorio propietaria, no como pesos abiertos, lo que dificulta una comparacion directa con modelos publicados en Hugging Face.

| Criterio | NeighborAGI | Alternativas de la misma categoria |
|---|---|---|
| Tipo de artefacto | Aplicacion de escritorio (binario) | no disponible |
| Pesos publicados | No | no disponible |
| Licencia | Propietaria (EULA) | no disponible |
| Parametros / contexto | no disponible | no disponible |

## Limitaciones y advertencias

- No se publican pesos ni arquitectura: imposible auditar el modelo, reproducir resultados o evaluar sesgos de forma independiente.
- Software propietario con EULA: el uso comercial esta sujeto a los terminos del acuerdo mostrado durante la instalacion; no es codigo abierto pese a estar alojado en Hugging Face.
- El repositorio solo contiene releases; el codigo fuente no es publico.
- Riesgo de alucinacion y sesgos: no evaluables sin acceso al modelo ni a documentacion tecnica.
- Soporte linguistico declarado limitado a ingles y arabe; no se especifica la calidad ni la cobertura real.
- Dependencia de un canal de actualizacion propietario: la aplicacion se actualiza automaticamente, lo que introduce un vector de confianza en la clave de firma del editor.
- Sin traccion verificable en la plataforma: 0 descargas y 0 likes en el momento de la consulta.
- Fecha de creacion del repositorio registrada como 2026-11-10, lo que conviene contrastar antes de tratarla como referencia temporal fiable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/islamII3620/NeighborAGI
- Instalador para Windows: https://huggingface.co/islamII3620/NeighborAGI/resolve/main/NeighborAGI-Setup-x64.exe
- Listado de archivos: https://huggingface.co/islamII3620/NeighborAGI/tree/main
