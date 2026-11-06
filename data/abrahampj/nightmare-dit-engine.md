# AbrahamPJ/nightmare-dit-engine

## Resumen

Nightmare DiT engine es un artefacto binario publicado en Hugging Face por el desarrollador AbrahamPJ bajo el identificador `AbrahamPJ/nightmare-dit-engine`. No se trata de un modelo de lenguaje ni de un modelo de difusion en el sentido habitual, sino de una libreria compartida compilada (`libdit_engine.so`) destinada a la aplicacion movil Nightmare, una app de generacion de imagen y video on-device para telefonos con SoC Snapdragon. El repositorio actua como segundo host (mirror) del ZIP publicado en las releases de GitHub de la aplicacion, con el objetivo de sortear redes donde `github.com` no es accesible.

El contenido del repositorio es un unico archivo `dit-engine-abi106-tilecut.zip` (aproximadamente 0,6 GB), cuyo SHA-256 se declara en la model card para verificacion de integridad. La app descarga el artefacto de forma automatica, por lo que no requiere intervencion manual del usuario final. El motor se compila en CI a partir de tres proyectos upstream: `xororz/local-dream` (licencia CC BY-NC 4.0), `stable-diffusion.cpp` (fork de happyyzy) y `ggml` (MIT), a los que se aplican los parches incluidos en `backend-patches/dit/` de la app.

La relevancia de esta ficha es limitada desde el punto de vista de evaluacion de modelos: no hay pesos, no hay arquitectura documentada, no hay benchmarks ni capacidades declaradas. Es un componente de despliegue de un pipeline de difusion (DiT, Diffusion Transformer) empaquetado para Android con ABI 106, orientado a inferencia en dispositivo. Cualquier uso queda restringido por la licencia no comercial del componente upstream principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere Diffusion Transformer, sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | mixta (`other` / `mixed`): componente principal CC BY-NC 4.0, `stable-diffusion.cpp` y `ggml` MIT |
| Formato de pesos | no disponible; el artefacto es un ZIP con `libdit_engine.so` (ABI 106) |
| Tamano del repositorio | 0,6 GB |
| SHA-256 del ZIP | `43d6c7c91ab28ff222e6ecb1eba8bbebc57e0bf5ce88de3f5943ffa8a7177a02` |
| Plataforma objetivo | Android sobre Snapdragon (ABI 106) |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura interna del motor ni sobre pesos o datos de entrenamiento. La model card indica unicamente el proceso de construccion: compilacion en CI a partir de `xororz/local-dream`, `stable-diffusion.cpp` (fork de happyyzy) y `ggml`, con los parches de `backend-patches/dit/` de la aplicacion Nightmare. El sufijo `tilecut` en el nombre del ZIP sugiere una estrategia de procesamiento por teselas (tiling) para reducir picos de memoria en inferencia movil, aunque no se documenta el detalle.

El prefijo `dit` y el contexto del proyecto apuntan a un motor de Diffusion Transformer, pero la model card no confirma que arquitectura concreta se ejecuta, ni el numero de parametros, ni el regimen de cuantizacion empleado en dispositivo. Tampoco se documentan innovaciones como decodificacion especulativa, atencion lineal o tecnicas de offloading; dado que `ggml` es la base, es plausible el uso de cuantizaciones de bajo bit para CPU/GPU movil, pero no se especifica.

## Capacidades

- Ejecucion de inferencia de difusion para generacion de imagen y video en dispositivo, segun la descripcion de la app Nightmare.
- Integracion como backend nativo (`libdit_engine.so`) dentro de una aplicacion Android para Snapdragon.
- Descarga automatica del artefacto desde el repositorio como host alternativo.
- Verificacion de integridad mediante SHA-256 declarado en la model card.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision por comprension, tool calling, agentes ni multilingueismo.
- No se documenta modo thinking, audio ni otras modalidades.

## Casos de uso

- Distribucion en redes restringidas: el repositorio sirve como espejo del ZIP de la release de GitHub para instalaciones donde `github.com` esta bloqueado; la app lo descarga automaticamente sin accion del usuario.
- Despliegue de generacion de imagen on-device: integracion del motor en la app Nightmare para producir imagenes localmente en telefonos Snapdragon, evitando enviar datos a servidores externos.
- Generacion de video on-device: el nombre del proyecto y la descripcion de la app mencionan video; el motor actuaria como backend de difusion para estos flujos.
- Verificacion de integridad en pipelines de distribucion: el SHA-256 publicado permite validar el artefacto en scripts de empaquetado o en una CDN propia antes de servirlo.
- Reutilizacion del codigo fuente compilado: dado que se construye a partir de `local-dream` y `stable-diffusion.cpp`, un equipo puede reproducir la build con los parches de `backend-patches/dit/` para otras ABI o dispositivos.
- Auditoria de licencias en producto: el aviso de `NOTICE` y la licencia mixta permiten evaluar si el uso previsto encaja con la restriccion no comercial de `local-dream`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Tampoco se ofrecen latencias, throughput, consumo energetico ni comparaciones con otros motores de inferencia movil.

## Requisitos de hardware

- VRAM estimada: no disponible; el objetivo es inferencia en GPU integrada de Snapdragon, no en GPU de escritorio.
- GPU recomendadas: no disponible; la plataforma declarada es Android sobre Snapdragon con ABI 106.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible; el artefacto es un `.so` para Android, no un binario de escritorio.
- Opciones de despliegue: la app Nightmare como unico consumidor documentado; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un motor de difusion movil.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Motor | Plataforma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| Nightmare DiT engine | Android / Snapdragon (ABI 106) | `.so` en ZIP | Mixta (CC BY-NC 4.0 + MIT) | Hugging Face y GitHub releases |
| `stable-diffusion.cpp` (happyyzy) | Multiplataforma (CPU/GPU) | Codigo fuente / binarios | MIT | GitHub |
| `local-dream` (xororz) | Android | Codigo fuente / binarios | CC BY-NC 4.0 | GitHub |
| `ggml` | Multiplataforma | Biblioteca | MIT | GitHub |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa entre estos componentes.

## Limitaciones y advertencias

- No es un modelo entrenado ni publica pesos: es un binario compilado; no puede evaluarse como modelo con benchmarks estandar.
- Licencia no comercial: el componente principal `local-dream` es CC BY-NC 4.0, lo que prohibe uso comercial del artefacto sin autorizacion adicional; la model card remite al `NOTICE` de la app.
- Ausencia de documentacion tecnica: no hay arquitectura, parametros, cuantizacion ni idiomas declarados, lo que impide evaluar sesgos, alucinacion o calidad de salida a partir de esta ficha.
- Dependencia de la app: el artefacto esta pensado para ser consumido por Nightmare; su uso fuera de ese contexto no esta soportado ni documentado.
- Compatibilidad limitada: ABI 106 y Snapdragon implican que no funcionara en otras arquitecturas ni en versiones de Android con ABI distinta sin recompilacion.
- Riesgo de integridad: la confianza depende del SHA-256 publicado; conviene verificarlo antes de cualquier despliegue propio.
- Fecha de creacion futura en los metadatos (2026), lo que puede indicar un error de reloj o de publicacion y dificulta el versionado fiable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AbrahamPJ/nightmare-dit-engine
- Release del ZIP en GitHub: https://github.com/AbrahamPaulJ/nightmare-mobile/releases/tag/dit-engine-abi106-tilecut
- Proyecto Nightmare mobile: https://github.com/AbrahamPaulJ/nightmare-mobile
- Upstream `local-dream`: https://github.com/xororz/local-dream
- Upstream `stable-diffusion.cpp` (fork): https://github.com/happyyzy/stable-diffusion.cpp
- `ggml`: no se proporciona URL en la informacion disponible (proyecto conocido en github.com/ggerganov/ggml, sin confirmar en la model card).
