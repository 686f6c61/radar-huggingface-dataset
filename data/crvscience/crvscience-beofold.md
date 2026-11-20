# crvscience/crvscience-beofold

## Resumen

BeoFold es una plataforma de software científica distribuida escrita íntegramente en Rust, orientada a dinámica molecular, plegamiento de estructuras proteicas y análisis cinético mediante modelos de estados de Markov (MSM). No se trata de un modelo de lenguaje ni de una red neuronal entrenada: es un motor de simulación física y computación distribuida, publicado en Hugging Face bajo el identificador `crvscience/crvscience-beofold` y desarrollado por CRV Science. Su propósito es ejecutar simulaciones de dinámica molecular tipo Langevin con intercambio de réplicas (MREMD) sobre clústeres Beowulf domésticos heterogéneos (Windows y Linux), con federación WAN entre múltiples clústeres mediante Apache HTTP.

La arquitectura se organiza en siete crates de Rust que cubren protocolo, física, almacenamiento, nodo de cómputo, sincronización web, interfaz gráfica y análisis MSM. El motor físico implementa potenciales de enlace armónico, torsiones Blondel-Karplus, Lennard-Jones 12-6 con corrección de fuerza, Coulomb apantallado por Generalized-Born y solvatación hidrofóbica gaussiana EEF1, junto con un integrador Langevin simétrico BAOAB y listas de vecinos Morton Z-order paralelizadas con Rayon. La versión documentada es la `v1.4.0`.

La relevancia del proyecto radica en ofrecer una alternativa de código abierto y pure-Rust a plataformas consolidadas de plegamiento distribuido como Folding@home, con verificación criptográfica de unidades de trabajo mediante Ed25519 y BLAKE3, replicación Raft para consenso entre clústeres y un visor 3D de conformaciones accesible por navegador. No se dispone de información sobre parámetros de modelo, contexto o cuantización porque el artefacto no es un modelo generativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Motor de simulación en Rust (crates: fold-proto, fold-physics, fold-storage, fold-node, fold-sync, fold-gui, fold-msm); no es un transformer ni una red neuronal |
| Parámetros totales | no disponible (no aplica) |
| Parámetros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantización | no disponible (no aplica) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible; el proyecto distribuye código fuente Rust y artefactos de simulación (PDB/mmCIF, blobs BLAKE3 comprimidos con LZ4) |

## Arquitectura y entrenamiento

BeoFold no entrena ningún modelo. Su núcleo físico (`fold-physics`) implementa un campo de fuerzas clásico para dinámica molecular: enlaces y ángulos armónicos, torsiones Blondel-Karplus libres de singularidades, potencial Lennard-Jones 12-6 con corrección de fuerza, Coulomb apantallado por Generalized-Born y solvatación hidrofóbica mediante gaussianas EEF1. La integración temporal usa un esquema Langevin simétrico BAOAB, con listas de vecinos construidas en orden Z de Morton y paralelizadas con Rayon. El remuestreo entre réplicas se realiza mediante un intercambiador Metropolis (MREMD) y se aplica una verificación biofísica de cuatro puertas para descartar conformaciones no plausibles.

El resto del sistema es infraestructura distribuida. `fold-proto` define las coordenadas PRCG de Folding@home, serializa frames con `rkyv` en modo zero-copy, comprime con `lz4_flex` y firma con Ed25519. `fold-storage` implementa un libro mayor ACID MVCC sobre `redb` con almacén de blobs direccionable por contenido y replicación de seguidores Raft con cuórum configurable. `fold-node` actúa como trabajador de cómputo con descubrimiento mDNS (`_beofold._udp.local.`), transporte QUIC con TLS 1.3 y limitación automática de recursos. `fold-sync` expone un servidor de sincronización en modo demonio `axum` o CGI RFC-3875, con panel público de solo lectura y autenticación Ed25519 en los endpoints de escritura. `fold-msm` implementa clustering k-medoids sobre RMSD de C-alfa con Horn/Kabsch, estimación MLE reversible de Prinz-Noé, diagonalización Jacobi cíclica, teoría de trayectorias de transición (committor `p_fold`) y coarse-graining PCCA+.

## Capacidades

- Simulación de dinámica molecular con campo de fuerzas clásico y termostato Langevin BAOAB.
- Plegamiento de estructuras proteicas a partir de ficheros PDB/mmCIF mediante parser `pdbtbx`.
- Muestreo con intercambio de réplicas (MREMD) y verificación biofísica de cuatro puertas.
- Cómputo distribuido en clústeres Beowulf LAN con descubrimiento automático mDNS y fallback unicast `/24`.
- Federación WAN entre múltiples clústeres mediante Apache `mod_proxy_http` o `mod_cgid`.
- Consenso entre clústeres con Raft (Ongaro-Ousterhout) y cuórum configurable.
- Almacenamiento ACID con replicación y verificación canaria determinista de 20 pasos.
- Firma criptográfica de unidades de trabajo y peticiones HTTP con Ed25519; integridad con BLAKE3.
- Análisis cinético MSM: clustering k-medoids, MLE reversible, PCCA+, committor y paisajes de energía libre 2D `(RMSD, R_g)`.
- Exportación de conformaciones representativas en `.pdb`, paisajes en SVG/CSV/JSON.
- Visor 3D de conformaciones en HTML5 Canvas accesible por navegador.
- Estación de trabajo de supervisor de escritorio con cuatro pestañas (`eframe`/`egui`).
- Instalación como servicio desatendido en Linux (systemd) y Windows (PowerShell).
- Aceleración GPU mediante `wgpu` con shaders WGSL para cálculos no enlazados.

## Casos de uso

- Investigación académica en plegamiento de proteínas: un laboratorio con varias estaciones de trabajo puede desplegar un clúster Beowulf doméstico y ejecutar simulaciones MREMD sin depender de infraestructura cloud, gracias al descubrimiento mDNS y al transporte QUIC/TLS 1.3.
- Análisis cinético de trayectorias: `fold-msm` permite construir modelos de estados de Markov, calcular el committor `p_fold` y exportar paisajes de energía libre 2D en SVG/CSV/JSON para publicaciones.
- Docencia en biofísica computacional: el comando `demo-analyze` y el visor público permiten ilustrar conceptos de dinámica molecular y MSM sin infraestructura dedicada.
- Federación de recursos entre instituciones: varios clústeres pueden sincronizarse vía Apache HTTP con consenso Raft, útil para proyectos colaborativos entre grupos con recursos heterogéneos.
- Reproducibilidad científica: el almacén direccionable por contenido con BLAKE3 y las verificaciones canarias de 20 pasos permiten auditar y reproducir ejecuciones concretas.
- Visualización y difusión: el panel `/beofold/dashboard` ofrece leaderboards federados y descarga directa de conformaciones `.pdb` para comunicación científica.
- Despliegue en infraestructura existente: el modo CGI RFC-3875 permite ejecutar `fold-sync` sobre un Apache ya instalado sin demonio persistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El proyecto está diseñado para hardware heterogéneo de escritorio y clústeres domésticos; no se especifican mínimos de VRAM ni de RAM en la información disponible.
- Aceleración GPU opcional mediante `wgpu` y shaders WGSL (`nonbonded.wgsl`), compatible con backends soportados por `wgpu` (Vulkan, Metal, DX12); no se detallan modelos de GPU concretos.
- CPU: el motor paraleliza con Rayon y construye listas de vecinos Morton Z-order; no se especifica número mínimo de núcleos.
- Despliegue: binarios `fold-node`, `fold-sync`, `fold-gui` y `fold-msm`, más scripts de instalación systemd y PowerShell incluidos en `deploy/`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Proyecto | Tipo | Distribución | Licencia | Aceleración GPU | Federación multi-clúster |
|---|---|---|---|---|---|
| BeoFold | Motor MD/MSM en Rust | Clúster Beowulf LAN + WAN Apache | no disponible | wgpu/WGSL | Sí (Raft + Apache) |
| Folding@home | Cliente de plegamiento distribuido | Red global centralizada | cliente propietario | Sí (CUDA/OpenCL) | No aplica (centralizada) |
| GROMACS | Motor MD en C/C++ | HPC local | LGPL | Sí (CUDA, HIP, SYCL) | No |
| OpenMM | Motor MD en C++/Python | HPC local y cloud | MIT | Sí (CUDA, HIP, OpenCL) | No |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite prompts, generación de texto ni tool calling; cualquier evaluación como modelo generativo carece de sentido.
- La licencia no está declarada en la información disponible; no puede asumirse uso comercial sin consultar al autor.
- No se especifican idiomas soportados ni localización de la interfaz.
- El proyecto se publicó con 0 descargas y 0 likes; no hay evidencia de adopción ni de validación independiente.
- La validación científica se apoya en un preprint companion (`APP-PREPRINT-02`) y una captura de pantalla; no se han publicado benchmarks de precisión frente a GROMACS u OpenMM en la información disponible.
- El campo de fuerzas es clásico y con solvatación implícita (EEF1, Generalized-Born); no cubre efectos cuánticos ni solvente explícito.
- La federación WAN depende de configuración correcta de Apache y de la gestión de secretos de clúster; una mala configuración de Ed25519 puede exponer endpoints de escritura.
- El proyecto exige compilación con toolchain Rust y no distribuye binarios precompilados en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/crvscience/crvscience-beofold
- CRV Science Apps Hub: https://crvscience.com/apps
- Preprint companion (`APP-PREPRINT-02`): https://crvscience.com/apps/preprints/beofold-distributed-protein-msm
- Zenodo Concept DOI: 10.5281/ze (truncado en la información disponible)
- Folding@home (referencia PRCG): https://foldingathome.org/science/folding
- Apache `mod_proxy_http`: https://httpd.apache.org/docs/current/mod/mod_proxy_http.html
- Apache `mod_cgid`: https://httpd.apache.org/docs/current/mod/mod_cgid.html
- Referencia MREMD: https://pmc.ncbi.nlm.nih.gov/articles/PMC1302658/
- Referencia Prinz-Noé MLE: https://pubs.aip.org/aip/jcp/article/134/17/174105/699460/Markov-models-of-molecular-kinetics-Generation-and
- Referencia PCCA+: https://www.mdpi.com/2079-3197/6/1/20
