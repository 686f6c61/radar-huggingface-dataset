# elyanlabs/cuda-power8-patches

## Resumen

`elyanlabs/cuda-power8-patches` no es un modelo de IA: es una copia espejo (snapshot) de un repositorio de codigo publicado por Elyan Labs cuyo contenido son parches binarios y scripts de compilacion para ejecutar NVIDIA CUDA sobre servidores IBM POWER8 con GPUs Tesla V100. El repositorio original es `github.com/Scottcjn/cuda-power8-patches` y existe tambien en GitLab bajo `elyan-labs`. No contiene pesos, tokenizador, configuracion de arquitectura ni pipeline de inferencia; la HuggingFace Pipeline aparece como no disponible y las descargas y likes son 0.

El problema que resuelve es concreto: NVIDIA solo certifica V100 sobre POWER9, de modo que en un S822 o S824 con POWER8 el driver rechaza la CPU. El proyecto documenta que CUDA 11.8 (driver 520.61.05) y CUDA 12.0.1 (driver 525.85.12) funcionan sin modificacion, y que CUDA 10.2.89 (driver 440.33.01) requiere un parche de un unico salto condicional en el blob `nv-kernel.o_binary` para saltarse la comprobacion de tipo de CPU.

Su relevancia practica para el publico de este blog es la reutilizacion de hardware POWER8 de segunda mano como nodo de inferencia con V100 a traves de OCuLink, algo coherente con los tags `llm-inference` y `power8` del repositorio. Es material de referencia tecnica, no un artefacto desplegable en HuggingFace: el propio autor advierte que "nada de lo que hay aqui se ejecuta en la infraestructura de HuggingFace".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica: no es un modelo de IA; es un repositorio de scripts y parches para CUDA |
| Parametros totales | no aplica |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica (documentacion en ingles) |
| Licencia | MIT (explicitamente limitada a scripts y documentacion) |
| Formato de pesos | no aplica: el repositorio contiene scripts `.sh`, un parche binario `.bin` y documentacion `.md` |
| Versiones de CUDA cubiertas | 10.2.89 (requiere parche), 11.8.0 (sin parche), 12.0.1 (sin parche) |
| Drivers de referencia | 440.33.01, 520.61.05, 525.85.12 |
| Plataforma | ppc64le (IBM POWER8) |
| Sistema operativo | Ubuntu 20.04 LTS (ppc64le), ultima version con soporte POWER8 |
| GPU probada | NVIDIA Tesla V100-SXM2-16GB conectada por adaptador OCuLink |
| Hardware probado | IBM Power S824 (8286-42A), doble CPU de 8 nucleos POWER8, 576 GB de RAM; IBM Power S822, 6 nucleos POWER8 |
| Compilador requerido | GCC 9, debe coincidir con el compilador del kernel |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de creacion en HuggingFace | 2026-10-23 |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento. Lo que hay es un parche binario sobre un blob propietario. En el driver 440.33.01 (CUDA 10.2) existe una funcion `rm_get_cpu_type` en el fichero `nv-kernel.o_binary`, en el offset `0xa68ab0`, que solo acepta POWER9 (familia PVR `0x4E`). El parche actua en el offset `0xa68af4` y sustituye los bytes `41 9e 00 3c` (`beq cr7, <valid_cpu>`) por `48 00 00 3c` (`b <valid_cpu>`), convirtiendo el salto condicional en incondicional y aceptando cualquier CPU POWER.

El razonamiento tecnico del autor es que POWER8 y POWER9 comparten extensiones SIMD VSX/AltiVec, modelo de memoria, coherencia de cache e interfaz PCIe, de modo que la comprobacion respondia a una decision comercial o de soporte y no a un requisito tecnico. NVIDIA elimino esa comprobacion a partir del driver 520, por lo que 11.8 y 12.0 no necesitan modificacion alguna. En cuanto a "entrenamiento": no existe; los datos de referencia son la matriz de compatibilidad de hardware y los scripts de compilacion e instalacion (`build_cuda_10.2_patched.sh`, `build_cuda_11.8.sh`, `build_cuda_12.0.1.sh`, `install_driver.sh`).

## Capacidades

- Ejecutar el runtime de CUDA 11.8.0 y 12.0.1 sin modificaciones sobre IBM POWER8, y CUDA 10.2.89 aplicando el parche binario.
- Compilar e instalar los modulos de kernel del driver en ppc64le con GCC 9 y las cabeceras del kernel correspondientes.
- Acceso funcional a cuBLAS y cuDNN, segun las notas de rendimiento del autor.
- Conexion de GPU externa mediante OCuLink: adaptador M.2 en una ranura libre, cable OCuLink y la V100 aparece como dispositivo PCIe estandar.
- Soporte de NVLink limitado: POWER8 dispone de NVLink 1.0 frente a NVLink 2.0 en POWER9.
- Documentacion de soporte: `docs/TECHNICAL_DETAILS.md` y `docs/TROUBLESHOOTING.md` dentro del repositorio.
- No incluye: tool calling, function calling, capacidades de agente, vision, audio, thinking mode ni ninguna funcion propia de un LLM. Los tags `llm-inference` describen el caso de uso previsto, no una capacidad implementada.

## Casos de uso

- Reacondicionamiento de servidores POWER8 para inferencia: un S824 o S822 de segunda mano con una V100 por OCuLink puede ejecutar cargas CUDA (por ejemplo, servidores de inferencia compilados para ppc64le) sin necesidad de adquirir hardware POWER9 o x86.
- Laboratorio de pruebas de compatibilidad: validar que una build de CUDA 12.0.1 y sus dependencias (cuBLAS, cuDNN) funcionan correctamente en ppc64le antes de trasladar la carga a produccion.
- Compilacion de artefactos ppc64le en CI: usar el nodo POWER8 con V100 como runner para generar y testear binarios con aceleracion GPU destinados a esa arquitectura.
- Preservacion de hardware clasico: mantener operativos sistemas Power S822/S824 que de otro modo quedarian sin soporte de aceleracion GPU, con Ubuntu 20.04 como ultima base con soporte POWER8.
- Investigacion en arquitecturas no x86: estudiar el comportamiento de kernels CUDA y del driver en una plataforma POWER de generacion anterior, incluida la comparativa NVLink 1.0 frente a 2.0.
- Formacion y experimentacion con coste reducido: montar un entorno CUDA completo con hardware de segunda mano para practicas de programacion GPU, asumiendo la ausencia de soporte oficial.
- Auditoria del parche: reproducir y verificar los offsets y bytes documentados (`0xa68ab0`, `0xa68af4`) sobre el driver 440.33.01 para entender el mecanismo antes de aplicarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio solo aporta notas cualitativas: el computo CUDA funciona con normalidad, cuBLAS y cuDNN son funcionales y algunas caracteristicas de NVLink pueden estar limitadas por tratarse de NVLink 1.0. No hay datos de throughput, latencia, tokens por segundo ni resultados de MMLU, HumanEval o GSM8K, y no tendria sentido medirlos sobre un repositorio de parches.

Estado de compatibilidad declarado por el autor:

| Version de CUDA | Driver | Parche necesario | Estado |
|---|---|---|---|
| 10.2.89 | 440.33.01 | Si (bypass de comprobacion de CPU) | Funcional |
| 11.8.0 | 520.61.05 | No | Funcional |
| 12.0.1 | 525.85.12 | No | Funcional |

## Requisitos de hardware

- Plataforma: IBM POWER8 (S822, S824 u otros). No funciona en x86_64 ni en POWER9 como objetivo del parche (en POWER9 el driver oficial ya acepta la CPU).
- GPU: NVIDIA Tesla V100-SXM2-16GB probada; el autor no documenta otros modelos.
- Conexion: las ranuras PCIe nativas de POWER8 no son adecuadas para GPUs modernas, por lo que se requiere un adaptador OCuLink M.2 y su cable correspondiente.
- Memoria del sistema: 576 GB de RAM en el S824 probado; no se indica minimo.
- Sistema operativo: Ubuntu 20.04 LTS ppc64le, ultima version con soporte oficial de POWER8.
- Toolchain: GCC 9 (debe coincidir con el compilador del kernel), `build-essential` y `linux-headers-$(uname -r)`.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada (dependera del modelo que se ejecute sobre la V100, no de este repositorio).
- Cabe en GPU de consumo: no disponible; la unica GPU documentada es una V100 de centro de datos.
- Opciones de despliegue: no se documentan frameworks de servicio (vLLM, llama.cpp, Ollama, TGI). El repositorio solo cubre la capa de driver y runtime CUDA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No existen modelos comparables porque no es un modelo. La comparacion relevante es entre estrategias de plataforma:

| Estrategia | Soporte | Licencia | Requisitos | Disponibilidad |
|---|---|---|---|---|
| Este repositorio (parche comunitario) | No oficial, mantenido por la comunidad | MIT para scripts y documentacion | POWER8, Ubuntu 20.04, V100, adaptador OCuLink | Publico en HuggingFace, GitHub y GitLab |
| Soporte oficial NVIDIA para V100 | Oficial por parte de NVIDIA | EULA de NVIDIA | POWER9 | Publico |
| Servidor x86_64 con GPU NVIDIA | Oficial por parte de NVIDIA | EULA de NVIDIA | x86_64, ranuras PCIe estandar | Publico |
| Inferencia solo en CPU sobre POWER8 | No aplica CUDA | No aplica | POWER8, sin GPU | Publico, sin aceleracion |

## Limitaciones y advertencias

- No es un modelo: no hay pesos, tokenizador, licencia de uso de modelo ni pipeline de inferencia. Cualquier expectativa de generar texto con este artefacto es erronea.
- Proyecto no oficial: NVIDIA no da soporte a V100 sobre POWER8. El propio autor lo resume con la advertencia de que, si algo se rompe, "te quedas con las dos mitades".
- El parche modifica un blob propietario (`nv-kernel.o_binary`) del driver de NVIDIA. Aunque el repositorio no redistribuye codigo propietario (solo el diferencial de bytes y scripts que descargan CUDA desde los servidores de NVIDIA), la legalidad de aplicar y distribuir parches binarios sobre software propietario esta sujeta al EULA que el usuario acepta al descargar.
- La licencia MIT cubre exclusivamente scripts y documentacion, no el software de NVIDIA ni el resultado del parcheo.
- Un unico byte incorrecto en el offset `0xa68af4` puede dejar el driver inoperativo o provocar un fallo del kernel; no hay validacion automatica documentada mas alla del script.
- Dependencia de Ubuntu 20.04 LTS ppc64le, que limita actualizaciones de seguridad y de toolchain a largo plazo.
- Requisito estricto de GCC 9 alineado con el compilador del kernel; discrepancias provocan fallos de carga del modulo.
- NVLink limitado a la version 1.0 de POWER8, con posibles restricciones en funciones que asumen NVLink 2.0.
- Ausencia total de benchmarks y de datos de rendimiento, latencia o estabilidad a largo plazo.
- La informacion de HuggingFace muestra 0 descargas y 0 likes, y una fecha de creacion de 2026-10-23; conviene verificar el estado real del proyecto en los repositorios de GitHub y GitLab antes de basarse en el.

## Enlaces

- HuggingFace: https://huggingface.co/elyanlabs/cuda-power8-patches
- Repositorio original en GitHub: https://github.com/Scottcjn/cuda-power8-patches
- Espejo en GitLab: https://gitlab.com/elyan-labs/cuda-power8-patches
- Perfil de GitHub del autor original: https://github.com/Scottcjn
- Documentacion tecnica del parche: `docs/TECHNICAL_DETAILS.md` dentro del repositorio
- Resolucion de problemas: `docs/TROUBLESHOOTING.md` dentro del repositorio
- Ecosistema Elyan Labs, BoTTube: https://bottube.ai
- Ecosistema Elyan Labs, RustChain: https://rustchain.org
